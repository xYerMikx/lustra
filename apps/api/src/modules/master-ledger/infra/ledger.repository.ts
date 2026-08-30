import { Injectable } from '@nestjs/common'
import { Prisma } from '@lumira/db'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  CreateManualEntryInput,
  LedgerStore,
  ListEntriesInput,
} from '@/modules/master-ledger/app/master-ledger.ports'
import type {
  LedgerCategoryRecord,
  LedgerEntryRecord,
} from '@/modules/master-ledger/domain/map-ledger'
import {
  ensureSystemCategoriesInStore,
  recordCompletedBookingIncome,
} from '@/modules/master-ledger/infra/record-booking-income-in-store'

const CATEGORY_SELECT = {
  id: true,
  kind: true,
  name: true,
  slug: true,
  isSystem: true,
} as const

const ENTRY_INCLUDE = {
  category: { select: { name: true } },
  booking: { select: { serviceTitle: true } },
} as const

@Injectable()
export class LedgerRepository implements LedgerStore {
  constructor(private readonly tx: TransactionManager) {}

  async findMasterIdByUserId(userId: string): Promise<string | null> {
    const row = await this.tx.getClient().masterProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    return row?.id ?? null
  }

  async ensureSystemCategories(
    masterId: string,
  ): Promise<LedgerCategoryRecord[]> {
    await ensureSystemCategoriesInStore(this.tx.getClient(), masterId)

    return this.listCategories(masterId)
  }

  async listCategories(masterId: string): Promise<LedgerCategoryRecord[]> {
    return this.tx.getClient().ledgerCategory.findMany({
      where: { masterId },
      orderBy: [{ kind: 'asc' }, { isSystem: 'desc' }, { name: 'asc' }],
      select: CATEGORY_SELECT,
    })
  }

  findCategory(
    masterId: string,
    categoryId: string,
  ): Promise<LedgerCategoryRecord | null> {
    return this.tx.getClient().ledgerCategory.findFirst({
      where: { id: categoryId, masterId },
      select: CATEGORY_SELECT,
    })
  }

  findCategoryBySlug(
    masterId: string,
    kind: LedgerCategoryRecord['kind'],
    slug: string,
  ): Promise<LedgerCategoryRecord | null> {
    return this.tx.getClient().ledgerCategory.findFirst({
      where: { masterId, kind, slug },
      select: CATEGORY_SELECT,
    })
  }

  async createCategory(input: {
    masterId: string
    kind: LedgerCategoryRecord['kind']
    name: string
    slug: string
  }): Promise<LedgerCategoryRecord> {
    try {
      return await this.tx.getClient().ledgerCategory.create({
        data: {
          masterId: input.masterId,
          kind: input.kind,
          name: input.name,
          slug: input.slug,
          isSystem: false,
        },
        select: CATEGORY_SELECT,
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT
      ) {
        const existing = await this.findCategoryBySlug(
          input.masterId,
          input.kind,
          input.slug,
        )

        if (existing) {
          return existing
        }
      }

      throw error
    }
  }

  findOwnedBooking(
    masterId: string,
    bookingId: string,
  ): Promise<{ id: string; status: string; serviceTitle: string } | null> {
    return this.tx.getClient().booking.findFirst({
      where: { id: bookingId, masterId },
      select: { id: true, status: true, serviceTitle: true },
    })
  }

  async createManualEntry(
    input: CreateManualEntryInput,
  ): Promise<LedgerEntryRecord> {
    const row = await this.tx.getClient().ledgerEntry.create({
      data: {
        masterId: input.masterId,
        kind: input.kind,
        source: 'manual',
        categoryId: input.categoryId,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        occurredOn: input.occurredOn,
        occurredAt: input.occurredAt,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        bookingId: input.bookingId,
        note: input.note,
      },
      include: ENTRY_INCLUDE,
    })

    return this.toEntryRecord(row)
  }

  async listEntries(input: ListEntriesInput): Promise<LedgerEntryRecord[]> {
    const rows = await this.tx.getClient().ledgerEntry.findMany({
      where: {
        masterId: input.masterId,
        occurredOn: {
          gte: input.from,
          lt: input.toExclusive,
        },
        ...(input.kind ? { kind: input.kind } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      },
      orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }],
      include: ENTRY_INCLUDE,
    })

    return rows.map((row) => this.toEntryRecord(row))
  }

  async findEntry(
    masterId: string,
    entryId: string,
  ): Promise<LedgerEntryRecord | null> {
    const row = await this.tx.getClient().ledgerEntry.findFirst({
      where: { id: entryId, masterId },
      include: ENTRY_INCLUDE,
    })

    return row ? this.toEntryRecord(row) : null
  }

  async deleteManualEntry(masterId: string, entryId: string): Promise<boolean> {
    const result = await this.tx.getClient().ledgerEntry.deleteMany({
      where: { id: entryId, masterId, source: 'manual' },
    })

    return result.count > 0
  }

  async backfillBookingIncome(masterId: string): Promise<void> {
    const db = this.tx.getClient()
    const bookings = await db.booking.findMany({
      where: {
        masterId,
        status: 'completed',
        ledgerEntries: { none: { source: 'booking' } },
      },
      select: {
        id: true,
        masterId: true,
        priceAmount: true,
        currency: true,
        serviceTitle: true,
        completedAt: true,
        startsAt: true,
      },
    })

    for (const booking of bookings) {
      await recordCompletedBookingIncome(db, booking)
    }
  }

  private toEntryRecord(row: {
    id: string
    kind: LedgerEntryRecord['kind']
    source: LedgerEntryRecord['source']
    categoryId: string
    amount: { toString(): string }
    currency: string
    occurredOn: Date
    occurredAt: Date
    periodStart: Date | null
    periodEnd: Date | null
    bookingId: string | null
    note: string | null
    category: { name: string }
    booking: { serviceTitle: string } | null
  }): LedgerEntryRecord {
    return {
      id: row.id,
      kind: row.kind,
      source: row.source,
      categoryId: row.categoryId,
      categoryName: row.category.name,
      amount: row.amount,
      currency: row.currency,
      occurredOn: row.occurredOn,
      occurredAt: row.occurredAt,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      bookingId: row.bookingId,
      note: row.note,
      serviceTitle: row.booking?.serviceTitle ?? row.note,
    }
  }
}
