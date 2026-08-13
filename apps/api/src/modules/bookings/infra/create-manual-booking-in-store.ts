import { Prisma } from '@lustra/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import { DomainError } from '@/common/errors/domain-error'
import type { CreateManualBookingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import { missingGranuleStarts } from '@/modules/bookings/domain/missing-granule-starts'
import { isSlotHoldable } from '@/modules/bookings/domain/slot-holdability'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function createManualBookingInStore(
  db: TxClient,
  input: CreateManualBookingStoreInput,
): Promise<BookingRecord> {
  await lockOverlappingGranules(
    db,
    input.masterId,
    input.startsAt,
    input.coverageEnd,
  )

  const granules = await db.timeSlot.findMany({
    where: {
      masterId: input.masterId,
      startsAt: { lt: input.coverageEnd },
      endsAt: { gt: input.startsAt },
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      holdExpiresAt: true,
    },
  })

  for (const slot of granules) {
    if (!isSlotHoldable(slot, input.now)) {
      throw DomainError.slotTaken()
    }
  }

  const guest = await upsertGuestMasterClient(db, {
    masterId: input.masterId,
    name: input.clientName,
    phone: input.phone,
    note: input.masterNote,
    source: input.channel,
  })

  if (guest.isBlocked) {
    throw DomainError.forbidden('Этот клиент в чёрном списке')
  }

  const extraStarts = missingGranuleStarts(
    input.startsAt,
    input.coverageEnd,
    input.granularityMin,
    granules.map((slot) => slot.startsAt),
  )

  const created = await db.booking.create({
    data: {
      masterId: input.masterId,
      masterClientId: guest.id,
      clientUserId: null,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
      serviceDurationMin: input.serviceDurationMin,
      bufferMin: input.bufferMin,
      priceAmount: new Prisma.Decimal(input.priceAmount),
      currency: input.currency,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: 'confirmed',
      source: 'master_manual',
      channel: input.channel,
      masterNote: input.masterNote,
      confirmedAt: input.now,
      createdByUserId: input.currentUserId,
      events: {
        create: {
          actorType: 'master',
          actorId: input.currentUserId,
          fromStatus: null,
          toStatus: 'confirmed',
          payload: { channel: input.channel, source: 'master_manual' },
        },
      },
    },
    select: { id: true },
  })

  const existingIds = granules.map((slot) => slot.id)

  if (existingIds.length > 0) {
    const claimed = await db.timeSlot.updateMany({
      where: {
        id: { in: existingIds },
        OR: [
          { status: 'open' },
          {
            status: 'held',
            holdExpiresAt: { lte: input.now },
          },
        ],
      },
      data: {
        status: 'booked',
        bookingId: created.id,
        holdId: null,
        holdExpiresAt: null,
        version: { increment: 1 },
      },
    })

    if (claimed.count !== existingIds.length) {
      throw DomainError.slotTaken()
    }

    await db.bookingSlot.createMany({
      data: existingIds.map((slotId) => ({
        bookingId: created.id,
        slotId,
      })),
    })
  }

  const extraIds: string[] = []

  for (const extraStart of extraStarts) {
    const extra = await db.timeSlot.create({
      data: {
        masterId: input.masterId,
        startsAt: extraStart,
        endsAt: new Date(extraStart.getTime() + input.granularityMin * 60_000),
        status: 'booked',
        bookingId: created.id,
        isExtra: true,
        outsideSchedule: true,
      },
      select: { id: true },
    })

    extraIds.push(extra.id)
  }

  if (extraIds.length > 0) {
    await db.bookingSlot.createMany({
      data: extraIds.map((slotId) => ({
        bookingId: created.id,
        slotId,
      })),
    })
  }

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingCreatedManual,
      aggregate: `booking:${created.id}`,
      payload: {
        bookingId: created.id,
        status: 'confirmed',
        source: 'master_manual',
      },
    },
  })

  const row = await db.booking.findUnique({
    where: { id: created.id },
    select: BOOKING_CABINET_SELECT,
  })

  if (!row) {
    throw new DomainError('INTERNAL', 'Бронь не найдена после создания')
  }

  return mapBookingRow(row)
}

async function lockOverlappingGranules(
  db: TxClient,
  masterId: string,
  startsAt: Date,
  coverageEnd: Date,
): Promise<void> {
  await db.timeSlot.updateMany({
    where: {
      masterId,
      startsAt: { lt: coverageEnd },
      endsAt: { gt: startsAt },
    },
    data: {
      version: { increment: 1 },
    },
  })
}

async function upsertGuestMasterClient(
  db: TxClient,
  input: {
    masterId: string
    name: string
    phone: string
    note: string | null
    source: CreateManualBookingStoreInput['channel']
  },
): Promise<{ id: string; isBlocked: boolean }> {
  const existing = await db.masterClient.findFirst({
    where: {
      masterId: input.masterId,
      phone: input.phone,
    },
    select: { id: true, isBlocked: true },
  })

  if (existing) {
    await db.masterClient.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        source: input.source,
        note: input.note,
      },
    })

    return existing
  }

  return db.masterClient.create({
    data: {
      masterId: input.masterId,
      name: input.name,
      phone: input.phone,
      note: input.note,
      source: input.source,
    },
    select: { id: true, isBlocked: true },
  })
}
