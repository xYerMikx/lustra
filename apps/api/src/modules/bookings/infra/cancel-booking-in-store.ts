import type { Prisma } from '@lustra/db'

import type { CancelBookingStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function cancelBookingInStore(
  db: TxClient,
  input: CancelBookingStoreInput,
): Promise<BookingRecord | null> {
  const existing = await db.booking.findUnique({
    where: { id: input.bookingId },
    select: { status: true },
  })

  if (!existing) {
    return null
  }

  const fromStatus = existing.status

  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      status: { in: ['hold', 'pending', 'confirmed'] },
    },
    data: {
      status: input.toStatus,
      cancelledAt: input.now,
      cancelledByType: input.cancelledByType,
      cancelReason: input.reason,
      holdExpiresAt: null,
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
        status: 'open',
        bookingId: null,
        holdId: null,
        holdExpiresAt: null,
        version: { increment: 1 },
      },
    })

    await db.bookingSlot.deleteMany({
      where: { bookingId: input.bookingId },
    })
  }

  await db.bookingEvent.create({
    data: {
      bookingId: input.bookingId,
      actorType: input.cancelledByType,
      actorId: input.actorId,
      fromStatus,
      toStatus: input.toStatus,
      payload: { reason: input.reason },
    },
  })

  await db.outboxEvent.create({
    data: {
      type: 'booking.cancelled',
      aggregate: `booking:${input.bookingId}`,
      payload: {
        bookingId: input.bookingId,
        status: input.toStatus,
        reason: input.reason,
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
