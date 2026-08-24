import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { FixedClock } from '@/common/time/clock.service'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import { ListLedgerUseCase } from '@/modules/master-ledger/app/list-ledger.usecase'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

describe('ListLedgerUseCase', () => {
  it('defaults to the current month and returns net totals', async () => {
    const store: LedgerStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      ensureSystemCategories: vi.fn().mockResolvedValue([]),
      listCategories: vi.fn().mockResolvedValue([
        { id: 'c1', kind: 'income', name: 'Услуги', slug: 'service', isSystem: true },
      ]),
      findCategory: vi.fn(),
      findCategoryBySlug: vi.fn(),
      createCategory: vi.fn(),
      findOwnedBooking: vi.fn(),
      createManualEntry: vi.fn(),
      listEntries: vi.fn().mockResolvedValue([
        {
          id: 'e1',
          kind: 'income',
          source: 'booking',
          categoryId: 'c1',
          categoryName: 'Услуги',
          amount: '60.00',
          currency: 'BYN',
          occurredOn: new Date('2026-08-21T00:00:00.000Z'),
          occurredAt: new Date('2026-08-21T12:00:00.000Z'),
          periodStart: null,
          periodEnd: null,
          bookingId: 'b1',
          note: 'Маникюр',
          serviceTitle: 'Маникюр',
        },
        {
          id: 'e2',
          kind: 'expense',
          source: 'manual',
          categoryId: 'c2',
          categoryName: 'Материалы',
          amount: '20.00',
          currency: 'BYN',
          occurredOn: new Date('2026-08-22T00:00:00.000Z'),
          occurredAt: new Date('2026-08-22T12:00:00.000Z'),
          periodStart: new Date('2026-08-01T00:00:00.000Z'),
          periodEnd: new Date('2026-08-31T00:00:00.000Z'),
          bookingId: null,
          note: 'Гель',
          serviceTitle: null,
        },
      ]),
      findEntry: vi.fn(),
      deleteManualEntry: vi.fn(),
      backfillBookingIncome: vi.fn(),
    }
    const useCase = new ListLedgerUseCase(
      store,
      new FixedClock(new Date('2026-08-23T12:00:00.000Z')),
    )

    const result = await useCase.execute(currentUser, {})

    expect(result.from).toBe('2026-08-01')
    expect(result.to).toBe('2026-08-31')
    expect(result.summary.incomeTotal).toBe('60.00')
    expect(result.summary.expenseTotal).toBe('20.00')
    expect(result.summary.netTotal).toBe('40.00')
    expect(store.backfillBookingIncome).toHaveBeenCalledWith('m1')
  })
})
