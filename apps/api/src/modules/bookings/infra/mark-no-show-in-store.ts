import type { Prisma } from '@lumira/db'

import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { MarkNoShowStoreInput } from '@/modules/bookings/app/booking.ports'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import { noShowRate } from '@/modules/bookings/domain/no-show-rate'
import {
  BOOKING_CABINET_SELECT,
  mapBookingRow,
} from '@/modules/bookings/infra/map-booking-row'

type TxClient = Prisma.TransactionClient

export async function markNoShowInStore(
  db: TxClient,
  input: MarkNoShowStoreInput,
): Promise<BookingRecord | null> {
  const updated = await db.booking.updateMany({
    where: {
      id: input.bookingId,
      masterId: input.masterId,
      status: input.fromStatus,
    },
    data: {
      status: 'no_show',
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
      fromStatus: input.fromStatus,
      toStatus: 'no_show',
      payload: {},
    },
  })

  if (input.clientUserId) {
    await db.clientProfile.updateMany({
      where: { userId: input.clientUserId },
      data: { noShowCount: { increment: 1 } },
    })
  }

  const [completedCount, noShowCount] = await Promise.all([
    db.booking.count({
      where: { masterId: input.masterId, status: 'completed' },
    }),
    db.booking.count({
      where: { masterId: input.masterId, status: 'no_show' },
    }),
  ])

  await db.masterStats.upsert({
    where: { masterId: input.masterId },
    create: {
      masterId: input.masterId,
      noShowRate: noShowRate(completedCount, noShowCount),
    },
    update: {
      noShowRate: noShowRate(completedCount, noShowCount),
    },
  })

  await db.outboxEvent.create({
    data: {
      type: OutboxEventType.BookingNoShow,
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
