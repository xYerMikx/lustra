import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import { CreateLedgerEntryUseCase } from '@/modules/master-ledger/app/create-ledger-entry.usecase'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import type { LedgerEntryRecord } from '@/modules/master-ledger/domain/map-ledger'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

function entryRecord(): LedgerEntryRecord {
  return {
    id: 'e1',
    kind: 'income',
    source: 'manual',
    categoryId: 'c-tip',
    categoryName: 'Чаевые',
    amount: '15.00',
    currency: 'BYN',
    occurredOn: new Date('2026-08-23T00:00:00.000Z'),
    occurredAt: new Date('2026-08-23T12:00:00.000Z'),
    periodStart: null,
    periodEnd: null,
    bookingId: null,
    note: 'Азер',
    serviceTitle: null,
  }
}

function buildStore(overrides: Partial<LedgerStore> = {}): LedgerStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    ensureSystemCategories: vi.fn(),
    listCategories: vi.fn(),
    findCategory: vi.fn().mockResolvedValue({
      id: 'c-tip',
      kind: 'income',
      name: 'Чаевые',
      slug: 'tip',
      isSystem: true,
    }),
    findCategoryBySlug: vi.fn(),
    createCategory: vi.fn(),
    findOwnedBooking: vi.fn(),
    createManualEntry: vi.fn(async (input) => ({
      ...entryRecord(),
      amount: input.amount,
      kind: input.kind,
      categoryId: input.categoryId,
      note: input.note,
    })),
    listEntries: vi.fn(),
    findEntry: vi.fn(),
    deleteManualEntry: vi.fn(),
    backfillBookingIncome: vi.fn(),
    ...overrides,
  }
}

function buildTx(): TransactionManager {
  return {
    run: async <T>(work: () => Promise<T>) => work(),
    getClient: vi.fn(),
  } as unknown as TransactionManager
}

describe('CreateLedgerEntryUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-23T12:00:00.000Z'))

  it('creates a manual tip without including it in visit income', async () => {
    const store = buildStore()
    const useCase = new CreateLedgerEntryUseCase(store, buildTx(), clock)

    const result = await useCase.execute(currentUser, {
      kind: 'income',
      categoryId: 'c-tip',
      amount: '15,5',
      note: 'Азер',
    })

    expect(result.entry.amount).toBe('15.50')
    expect(result.entry.source).toBe('manual')
    expect(store.createManualEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        masterId: 'm1',
        amount: '15.50',
        categoryId: 'c-tip',
        kind: 'income',
      }),
    )
  })

  it('rejects a category of the opposite kind', async () => {
    const store = buildStore({
      findCategory: vi.fn().mockResolvedValue({
        id: 'c-mat',
        kind: 'expense',
        name: 'Материалы',
        slug: 'materials',
        isSystem: true,
      }),
    })
    const useCase = new CreateLedgerEntryUseCase(store, buildTx(), clock)

    await expect(
      useCase.execute(currentUser, {
        kind: 'income',
        categoryId: 'c-mat',
        amount: '10',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
  })
})
