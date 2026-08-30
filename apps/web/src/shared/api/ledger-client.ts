import type {
  CreateLedgerCategoryInput,
  CreateLedgerEntryInput,
  LedgerCategoryResponse,
  LedgerEntryResponse,
  LedgerListResponse,
  ListLedgerQuery,
} from '@lumira/contracts'

import { apiFetch } from '@/shared/api/http'

export function listMasterLedger(query: ListLedgerQuery) {
  const params = new URLSearchParams()

  if (query.from) {
    params.set('from', query.from)
  }

  if (query.to) {
    params.set('to', query.to)
  }

  if (query.kind) {
    params.set('kind', query.kind)
  }

  if (query.categoryId) {
    params.set('categoryId', query.categoryId)
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : ''

  return apiFetch<LedgerListResponse>(`/master/ledger${suffix}`)
}

export function createLedgerEntry(input: CreateLedgerEntryInput) {
  return apiFetch<LedgerEntryResponse>('/master/ledger/entries', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function createLedgerCategory(input: CreateLedgerCategoryInput) {
  return apiFetch<LedgerCategoryResponse>('/master/ledger/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteLedgerEntry(entryId: string) {
  return apiFetch<void>(`/master/ledger/entries/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
  })
}
