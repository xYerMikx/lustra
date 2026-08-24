import type {
  LedgerCategoryView,
  LedgerEntryView,
  LedgerKind,
  LedgerSource,
} from '@lustra/contracts'

import { decimalToMoneyString } from '@/modules/master-ledger/domain/parse-money'

export type LedgerCategoryRecord = {
  id: string
  kind: LedgerKind
  name: string
  slug: string
  isSystem: boolean
}

export type LedgerEntryRecord = {
  id: string
  kind: LedgerKind
  source: LedgerSource
  categoryId: string
  categoryName: string
  amount: { toString(): string } | string | number
  currency: string
  occurredOn: Date
  occurredAt: Date
  periodStart: Date | null
  periodEnd: Date | null
  bookingId: string | null
  note: string | null
  serviceTitle: string | null
}

export function dateToYmd(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function toLedgerCategoryView(
  record: LedgerCategoryRecord,
): LedgerCategoryView {
  return {
    id: record.id,
    kind: record.kind,
    name: record.name,
    slug: record.slug,
    isSystem: record.isSystem,
  }
}

export function toLedgerEntryView(record: LedgerEntryRecord): LedgerEntryView {
  return {
    id: record.id,
    kind: record.kind,
    source: record.source,
    categoryId: record.categoryId,
    categoryName: record.categoryName,
    amount: decimalToMoneyString(record.amount),
    currency: record.currency,
    occurredOn: dateToYmd(record.occurredOn),
    occurredAt: record.occurredAt.toISOString(),
    periodStart: record.periodStart ? dateToYmd(record.periodStart) : null,
    periodEnd: record.periodEnd ? dateToYmd(record.periodEnd) : null,
    bookingId: record.bookingId,
    note: record.note,
    serviceTitle: record.serviceTitle,
  }
}
