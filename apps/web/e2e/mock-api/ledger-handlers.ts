import { randomUUID } from 'node:crypto'
import type {
  LedgerCategoryView,
  LedgerEntryView,
  LedgerKind,
  LedgerListResponse,
} from '@lustra/contracts'

import { MASTER_PROFILE_ID, MASTER_USER_ID } from '../ids'
import { requireUser, type HandlerResult } from './auth-handlers'
import { asRecord, type MockRequest } from './http'
import { apiError, type E2eLedgerCategory, type E2eLedgerEntry, type MockWorld } from './types'

function masterIdFor(userId: string): string | null {
  return userId === MASTER_USER_ID ? MASTER_PROFILE_ID : null
}

function ymd(value: Date | string): string {
  return String(value).slice(0, 10)
}

function toCategoryView(row: E2eLedgerCategory): LedgerCategoryView {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    slug: row.slug,
    isSystem: row.isSystem,
  }
}

function toEntryView(row: E2eLedgerEntry): LedgerEntryView {
  return {
    id: row.id,
    kind: row.kind,
    source: row.source,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    amount: row.amount,
    currency: row.currency,
    occurredOn: row.occurredOn,
    occurredAt: row.occurredAt,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    bookingId: row.bookingId,
    note: row.note,
    serviceTitle: row.serviceTitle,
  }
}

function money(parts: string[]): string {
  return parts.reduce((sum, part) => sum + Number(part), 0).toFixed(2)
}

export function recordBookingIncome(world: MockWorld, booking: {
  id: string
  masterId: string
  priceAmount: string
  currency: string
  serviceTitle: string
  completedAt: string | null
}): void {
  if (world.ledgerEntries.some((item) => item.bookingId === booking.id && item.source === 'booking')) {
    return
  }

  const category = world.ledgerCategories.find(
    (item) => item.masterId === booking.masterId && item.slug === 'service',
  )

  if (!category) {
    return
  }

  const occurredAt = booking.completedAt ?? new Date().toISOString()

  world.ledgerEntries.push({
    id: randomUUID(),
    masterId: booking.masterId,
    kind: 'income',
    source: 'booking',
    categoryId: category.id,
    categoryName: category.name,
    amount: booking.priceAmount,
    currency: booking.currency,
    occurredOn: ymd(occurredAt),
    occurredAt,
    periodStart: null,
    periodEnd: null,
    bookingId: booking.id,
    note: booking.serviceTitle,
    serviceTitle: booking.serviceTitle,
  })
}

export function handleMasterLedger(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (!pathname.startsWith('/master/ledger')) {
    return null
  }

  const gated = requireUser(world, request, 'master')

  if ('response' in gated) {
    return gated
  }

  const masterId = masterIdFor(gated.user.id)

  if (!masterId) {
    return { response: apiError(404, 'NOT_FOUND', 'Профиль мастера не найден') }
  }

  const categories = world.ledgerCategories.filter((item) => item.masterId === masterId)

  if (method === 'GET' && pathname === '/master/ledger') {
    const from = request.searchParams.get('from') ?? '0000-01-01'
    const to = request.searchParams.get('to') ?? '9999-12-31'
    const kind = request.searchParams.get('kind') as LedgerKind | null
    const categoryId = request.searchParams.get('categoryId')
    const items = world.ledgerEntries.filter((item) => {
      if (item.masterId !== masterId) {
        return false
      }

      if (item.occurredOn < from || item.occurredOn > to) {
        return false
      }

      if (kind && item.kind !== kind) {
        return false
      }

      return !categoryId || item.categoryId === categoryId
    })
    const incomeTotal = money(items.filter((item) => item.kind === 'income').map((item) => item.amount))
    const expenseTotal = money(items.filter((item) => item.kind === 'expense').map((item) => item.amount))
    const body: LedgerListResponse = {
      from,
      to,
      summary: {
        incomeTotal,
        expenseTotal,
        netTotal: (Number(incomeTotal) - Number(expenseTotal)).toFixed(2),
        currency: 'BYN',
      },
      categories: categories.map(toCategoryView),
      items: items.map(toEntryView),
    }

    return { response: { status: 200, body } }
  }

  if (method === 'POST' && pathname === '/master/ledger/categories') {
    const body = asRecord(request.body)
    const kind = body.kind === 'expense' ? 'expense' : 'income'
    const name = String(body.name ?? '').trim()

    if (!name) {
      return { response: apiError(400, 'VALIDATION_FAILED', 'Укажите название') }
    }

    const row: E2eLedgerCategory = {
      id: randomUUID(),
      masterId,
      kind,
      name,
      slug: name.toLowerCase(),
      isSystem: false,
    }
    world.ledgerCategories.push(row)

    return { response: { status: 201, body: { category: toCategoryView(row) } } }
  }

  if (method === 'POST' && pathname === '/master/ledger/entries') {
    const body = asRecord(request.body)
    const category = categories.find((item) => item.id === String(body.categoryId ?? ''))

    if (!category) {
      return { response: apiError(404, 'NOT_FOUND', 'Категория не найдена') }
    }

    const occurredOn = String(body.occurredOn ?? new Date().toISOString().slice(0, 10))
    const row: E2eLedgerEntry = {
      id: randomUUID(),
      masterId,
      kind: category.kind,
      source: 'manual',
      categoryId: category.id,
      categoryName: category.name,
      amount: Number(String(body.amount ?? '0').replace(',', '.')).toFixed(2),
      currency: 'BYN',
      occurredOn,
      occurredAt: new Date().toISOString(),
      periodStart: body.periodStart ? String(body.periodStart) : null,
      periodEnd: body.periodEnd ? String(body.periodEnd) : null,
      bookingId: body.bookingId ? String(body.bookingId) : null,
      note: body.note ? String(body.note) : null,
      serviceTitle: body.note ? String(body.note) : null,
    }
    world.ledgerEntries.push(row)

    return { response: { status: 201, body: { entry: toEntryView(row) } } }
  }

  const remove = pathname.match(/^\/master\/ledger\/entries\/([^/]+)$/)

  if (method === 'DELETE' && remove) {
    const index = world.ledgerEntries.findIndex(
      (item) => item.id === remove[1] && item.masterId === masterId && item.source === 'manual',
    )

    if (index < 0) {
      return { response: apiError(404, 'NOT_FOUND', 'Запись не найдена') }
    }

    world.ledgerEntries.splice(index, 1)

    return { response: { status: 204 } }
  }

  return { response: apiError(404, 'NOT_FOUND', 'Не найдено') }
}
