import type { LedgerKind } from '@lumira/contracts'

import type {
  LedgerCategoryRecord,
  LedgerEntryRecord,
} from '@/modules/master-ledger/domain/map-ledger'

export type CreateManualEntryInput = {
  masterId: string
  kind: LedgerKind
  categoryId: string
  amount: string
  currency: string
  occurredOn: Date
  occurredAt: Date
  periodStart: Date | null
  periodEnd: Date | null
  bookingId: string | null
  note: string | null
}

export type ListEntriesInput = {
  masterId: string
  from: Date
  toExclusive: Date
  kind?: LedgerKind
  categoryId?: string
}

export type LedgerStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  ensureSystemCategories(masterId: string): Promise<LedgerCategoryRecord[]>
  listCategories(masterId: string): Promise<LedgerCategoryRecord[]>
  findCategory(
    masterId: string,
    categoryId: string,
  ): Promise<LedgerCategoryRecord | null>
  findCategoryBySlug(
    masterId: string,
    kind: LedgerKind,
    slug: string,
  ): Promise<LedgerCategoryRecord | null>
  createCategory(input: {
    masterId: string
    kind: LedgerKind
    name: string
    slug: string
  }): Promise<LedgerCategoryRecord>
  findOwnedBooking(
    masterId: string,
    bookingId: string,
  ): Promise<{ id: string; status: string; serviceTitle: string } | null>
  createManualEntry(input: CreateManualEntryInput): Promise<LedgerEntryRecord>
  listEntries(input: ListEntriesInput): Promise<LedgerEntryRecord[]>
  findEntry(
    masterId: string,
    entryId: string,
  ): Promise<LedgerEntryRecord | null>
  deleteManualEntry(masterId: string, entryId: string): Promise<boolean>
  backfillBookingIncome(masterId: string): Promise<void>
}
