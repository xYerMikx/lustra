import type { Prisma } from '@lumira/db'

import { DomainError } from '@/common/errors/domain-error'
import { missingGranuleStarts } from '@/modules/bookings/domain/missing-granule-starts'
import { isSlotHoldable } from '@/modules/bookings/domain/slot-holdability'

type TxClient = Prisma.TransactionClient

export async function attachBookingToGranules(
  db: TxClient,
  input: {
    masterId: string
    bookingId: string
    startsAt: Date
    coverageEnd: Date
    granularityMin: number
    now: Date
  },
): Promise<void> {
  await db.timeSlot.updateMany({
    where: {
      masterId: input.masterId,
      startsAt: { lt: input.coverageEnd },
      endsAt: { gt: input.startsAt },
    },
    data: {
      version: { increment: 1 },
    },
  })

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
        bookingId: input.bookingId,
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
        bookingId: input.bookingId,
        slotId,
      })),
    })
  }

  const extraStarts = missingGranuleStarts(
    input.startsAt,
    input.coverageEnd,
    input.granularityMin,
    granules.map((slot) => slot.startsAt),
  )

  const extraIds: string[] = []

  for (const extraStart of extraStarts) {
    const extra = await db.timeSlot.create({
      data: {
        masterId: input.masterId,
        startsAt: extraStart,
        endsAt: new Date(extraStart.getTime() + input.granularityMin * 60_000),
        status: 'booked',
        bookingId: input.bookingId,
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
        bookingId: input.bookingId,
        slotId,
      })),
    })
  }
}
