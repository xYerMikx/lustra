import { Prisma } from '@lumira/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import { DomainError } from '@/common/errors/domain-error'
import type { RescheduleBookingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import { attachBookingToGranules } from '@/modules/bookings/infra/attach-booking-to-granules'
import { cancelBookingInStore } from '@/modules/bookings/infra/cancel-booking-in-store'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function rescheduleBookingInStore(
  db: TxClient,
  input: RescheduleBookingStoreInput,
): Promise<BookingRecord | null> {
  const existing = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: {
      masterId: true,
      masterClientId: true,
      clientUserId: true,
      serviceId: true,
      serviceTitle: true,
      serviceDurationMin: true,
      bufferMin: true,
      priceAmount: true,
      currency: true,
      source: true,
      channel: true,
      clientComment: true,
      masterNote: true,
      status: true,
    },
  })

  if (
    !existing ||
    existing.masterId !== input.masterId ||
    (existing.status !== 'pending' && existing.status !== 'confirmed')
  ) {
    return null
  }

  const cancelled = await cancelBookingInStore(db, {
    bookingId: input.bookingId,
    toStatus: 'cancelled_by_master',
    cancelledByType: 'master',
    currentUserId: input.currentUserId,
    reason: input.reason,
    now: input.now,
  })

  if (!cancelled) {
    return null
  }

  const created = await db.booking.create({
    data: {
      masterId: existing.masterId,
      masterClientId: existing.masterClientId,
      clientUserId: existing.clientUserId,
      serviceId: existing.serviceId,
      serviceTitle: existing.serviceTitle,
      serviceDurationMin: existing.serviceDurationMin,
      bufferMin: input.bufferMin,
      priceAmount: new Prisma.Decimal(String(existing.priceAmount)),
      currency: existing.currency,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: 'confirmed',
      source: existing.source,
      channel: existing.channel,
      clientComment: existing.clientComment,
      masterNote: existing.masterNote,
      confirmedAt: input.now,
      rescheduledFromId: input.bookingId,
      createdByUserId: input.currentUserId,
      events: {
        create: {
          actorType: 'master',
          actorId: input.currentUserId,
          fromStatus: null,
          toStatus: 'confirmed',
          payload: {
            rescheduledFromId: input.bookingId,
            reason: input.reason,
          },
        },
      },
    },
    select: { id: true },
  })

  await attachBookingToGranules(db, {
    masterId: existing.masterId,
    bookingId: created.id,
    startsAt: input.startsAt,
    coverageEnd: input.coverageEnd,
    granularityMin: input.granularityMin,
    now: input.now,
  })

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingCreated,
      aggregate: `booking:${created.id}`,
      payload: {
        bookingId: created.id,
        status: 'confirmed',
        rescheduledFromId: input.bookingId,
      },
    },
  })

  const row = await db.booking.findUnique({
    where: { id: created.id },
    select: BOOKING_CABINET_SELECT,
  })

  if (!row) {
    throw new DomainError('INTERNAL', 'Бронь не найдена после переноса')
  }

  return mapBookingRow(row)
}
