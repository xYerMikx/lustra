import type { Prisma } from '@lustra/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { CompleteBookingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function completeBookingInStore(
  db: TxClient,
  input: CompleteBookingStoreInput,
): Promise<BookingRecord | null> {
  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      masterId: input.masterId,
      status: 'confirmed',
    },
    data: {
      status: 'completed',
      completedAt: input.now,
      version: { increment: 1 },
    },
  })

  if (updated.count === 0) {
    return null
  }

  await db.bookingEvent.create({
    data: {
      bookingId: input.bookingId,
      actorType: 'master',
      actorId: input.currentUserId,
      fromStatus: 'confirmed',
      toStatus: 'completed',
      payload: {},
    },
  })

  await db.masterStats.upsert({
    where: { masterId: input.masterId },
    create: {
      masterId: input.masterId,
      bookingsCompleted: 1,
    },
    update: {
      bookingsCompleted: { increment: 1 },
    },
  })

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingCompleted,
      aggregate: `booking:${input.bookingId}`,
      payload: {
        bookingId: input.bookingId,
        masterId: input.masterId,
      },
    },
  })

  const row = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: BOOKING_CABINET_SELECT,
  })

  if (!row) {
    return null
  }

  return mapBookingRow(row)
}
