import { Prisma } from '@lustra/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import { DomainError } from '@/common/errors/domain-error'
import type { CreateManualBookingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import { clientNoteFromHandle } from '@/modules/bookings/domain/social-handle-note'
import { attachBookingToGranules } from '@/modules/bookings/infra/attach-booking-to-granules'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function createManualBookingInStore(
  db: TxClient,
  input: CreateManualBookingStoreInput,
): Promise<BookingRecord> {
  const guest = await upsertGuestMasterClient(db, {
    masterId: input.masterId,
    name: input.clientName,
    phone: input.phone,
    socialHandle: input.socialHandle,
    source: input.channel,
  })

  if (guest.isBlocked) {
    throw DomainError.forbidden('Этот клиент в чёрном списке')
  }

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

  await attachBookingToGranules(db, {
    masterId: input.masterId,
    bookingId: created.id,
    startsAt: input.startsAt,
    coverageEnd: input.coverageEnd,
    granularityMin: input.granularityMin,
    now: input.now,
  })

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

async function upsertGuestMasterClient(
  db: TxClient,
  input: {
    masterId: string
    name: string
    phone: string | null
    socialHandle: string | null
    source: CreateManualBookingStoreInput['channel']
  },
): Promise<{ id: string; isBlocked: boolean }> {
  const handleNote = clientNoteFromHandle(input.socialHandle)

  // Identity matching by Instagram/Telegram handle is not implemented yet.
  // Match only a concrete phone — `phone: null` would collide with every
  // guest who has no number (Prisma treats that as IS NULL).
  if (input.phone) {
    const existing = await db.masterClient.findFirst({
      where: {
        masterId: input.masterId,
        phone: input.phone,
      },
      select: { id: true, isBlocked: true, note: true },
    })

    if (existing) {
      await db.masterClient.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          source: input.source,
          note: handleNote ?? existing.note,
        },
      })

      return existing
    }
  }

  return db.masterClient.create({
    data: {
      masterId: input.masterId,
      name: input.name,
      phone: input.phone,
      note: handleNote,
      source: input.source,
    },
    select: { id: true, isBlocked: true },
  })
}
