import { describe, expect, it } from 'vitest'

import {
  breakdownTickCount,
  buildLedgerBreakdown,
  buildLedgerSeries,
  ledgerBarHeight,
  ledgerSeriesMax,
} from '@/features/master-ledger/model/build-ledger-series'

const visit = {
  kind: 'income' as const,
  amount: '80',
  occurredOn: '2026-08-18',
  categoryName: 'Услуги',
}

const tip = {
  kind: 'income' as const,
  amount: '20',
  occurredOn: '2026-08-18',
  categoryName: 'Чаевые',
}

const rent = {
  kind: 'expense' as const,
  amount: '40',
  occurredOn: '2026-08-20',
  categoryName: 'Аренда',
}

describe('buildLedgerSeries', () => {
  it('builds a bar per day for a week', () => {
    const points = buildLedgerSeries([visit, tip, rent], '2026-08-17', '2026-08-23')

    expect(points).toHaveLength(7)
    expect(points[1]).toMatchObject({
      key: '2026-08-18',
      income: 100,
      expense: 0,
    })
    expect(points[3]).toMatchObject({
      key: '2026-08-20',
      income: 0,
      expense: 40,
    })
    expect(ledgerSeriesMax(points)).toBe(100)
    expect(ledgerBarHeight(40, 100, 120)).toBe(48)
  })

  it('buckets a month into ISO weeks', () => {
    const points = buildLedgerSeries(
      [
        { kind: 'income', amount: '10', occurredOn: '2026-08-03' },
        { kind: 'income', amount: '5', occurredOn: '2026-08-10' },
      ],
      '2026-08-01',
      '2026-08-31',
    )

    expect(points.length).toBeGreaterThan(4)
    expect(points[0]?.key).toBe('2026-07-27')
    expect(points.some((point) => point.income === 10)).toBe(true)
    expect(points.some((point) => point.income === 5)).toBe(true)
  })
})

describe('buildLedgerBreakdown', () => {
  it('groups by category and keeps the largest rows', () => {
    const rows = buildLedgerBreakdown([visit, tip, rent, visit], 5)

    expect(rows[0]).toEqual({
      categoryName: 'Услуги',
      kind: 'income',
      amount: 160,
    })
    expect(rows).toHaveLength(3)
    expect(breakdownTickCount(80, 160, 10)).toBe(5)
  })
})
