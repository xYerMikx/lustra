import type { Prisma } from '@lumira/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { ConfirmPendingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function confirmPendingInStore(
  db: TxClient,
  input: ConfirmPendingStoreInput,
): Promise<BookingRecord | null> {
  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      masterId: input.masterId,
      status: 'pending',
    },
    data: {
      status: 'confirmed',
      confirmedAt: input.now,
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
      fromStatus: 'pending',
      toStatus: 'confirmed',
      payload: {},
    },
  })

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingConfirmed,
      aggregate: `booking:${input.bookingId}`,
      payload: {
        bookingId: input.bookingId,
        status: 'confirmed',
      },
    },
  })

  const row = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: BOOKING_CABINET_SELECT,
  })

  return row ? mapBookingRow(row) : null
}
