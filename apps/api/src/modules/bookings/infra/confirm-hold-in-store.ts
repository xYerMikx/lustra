import type { Prisma } from '@lustra/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { ConfirmHoldInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function confirmHoldInStore(
  db: TxClient,
  input: ConfirmHoldInput,
): Promise<BookingRecord | null> {
  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      status: 'hold',
      holdExpiresAt: { gt: input.now },
    },
    data: {
      status: input.toStatus,
      clientComment: input.clientComment,
      holdExpiresAt: null,
      confirmedAt: input.confirmedAt,
      version: { increment: 1 },
    },
  })

  if (updated.count === 0) {
    return null
  }

  const links = await db.bookingSlot.findMany({
    where: { bookingId: input.bookingId },
    select: { slotId: true },
  })

  const slotIds = links.map((link) => link.slotId)

  if (slotIds.length > 0) {
    await db.timeSlot.updateMany({
      where: { id: { in: slotIds } },
      data: {
        status: 'booked',
        bookingId: input.bookingId,
        holdId: null,
        holdExpiresAt: null,
        version: { increment: 1 },
      },
    })
  }

  await db.bookingEvent.create({
    data: {
      bookingId: input.bookingId,
      actorType: 'client',
      actorId: input.clientUserId,
      fromStatus: 'hold',
      toStatus: input.toStatus,
      payload: { comment: input.clientComment },
    },
  })

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingCreated,
      aggregate: `booking:${input.bookingId}`,
      payload: {
        bookingId: input.bookingId,
        status: input.toStatus,
      },
    },
  })

  const row = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: BOOKING_CABINET_SELECT,
  })

  return row ? mapBookingRow(row) : null
}
