import { describe, expect, it } from 'vitest'

import { rankByCompletedVisits } from '@/modules/bookings/domain/rank-master-clients-by-completed'

describe('rankByCompletedVisits', () => {
  it('orders by COUNT(completed) and ignores a stale visitsCount column', () => {
    const ranked = rankByCompletedVisits([
      {
        id: 'stale',
        name: 'Оля',
        visitsCountColumn: 12,
        completedCount: 1,
        lastCompletedAt: '2026-08-20T10:00:00.000Z',
      },
      {
        id: 'regular',
        name: 'Анна',
        visitsCountColumn: 0,
        completedCount: 3,
        lastCompletedAt: '2026-08-01T10:00:00.000Z',
      },
      {
        id: 'same-count-newer',
        name: 'Богдан',
        visitsCountColumn: 0,
        completedCount: 3,
        lastCompletedAt: '2026-08-21T10:00:00.000Z',
      },
    ])

    expect(ranked.map((row) => row.id)).toEqual([
      'same-count-newer',
      'regular',
      'stale',
    ])
  })
})
