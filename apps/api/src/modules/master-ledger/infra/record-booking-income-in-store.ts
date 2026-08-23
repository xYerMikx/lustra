import { Prisma } from '@lustra/db'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import {
  ymdInMinsk,
  ymdToUtcDate,
} from '@/modules/master-ledger/domain/ledger-period'
import { decimalToMoneyString } from '@/modules/master-ledger/domain/parse-money'
import { SYSTEM_LEDGER_CATEGORIES } from '@/modules/master-ledger/domain/system-categories'

type TxClient = Prisma.TransactionClient

export type BookingIncomeSource = {
  id: string
  masterId: string
  priceAmount: { toString(): string } | string | number
  currency: string
  serviceTitle: string
  completedAt: Date | null
  startsAt: Date
}

export async function ensureSystemCategoriesInStore(
  db: TxClient,
  masterId: string,
): Promise<void> {
  await db.ledgerCategory.createMany({
    data: SYSTEM_LEDGER_CATEGORIES.map((item) => ({
      masterId,
      kind: item.kind,
      slug: item.slug,
      name: item.name,
      isSystem: true,
    })),
    skipDuplicates: true,
  })
}

export async function recordCompletedBookingIncome(
  db: TxClient,
  booking: BookingIncomeSource,
): Promise<void> {
  await ensureSystemCategoriesInStore(db, booking.masterId)

  const category = await db.ledgerCategory.findFirst({
    where: {
      masterId: booking.masterId,
      kind: 'income',
      slug: 'service',
    },
    select: { id: true },
  })

  if (!category) {
    return
  }

  const occurredAt = booking.completedAt ?? booking.startsAt

  try {
    await db.ledgerEntry.create({
      data: {
        masterId: booking.masterId,
        kind: 'income',
        source: 'booking',
        categoryId: category.id,
        amount: new Prisma.Decimal(decimalToMoneyString(booking.priceAmount)),
        currency: booking.currency,
        occurredOn: ymdToUtcDate(ymdInMinsk(occurredAt)),
        occurredAt,
        bookingId: booking.id,
        note: booking.serviceTitle,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT
    ) {
      return
    }

    throw error
  }
}
