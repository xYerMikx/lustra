import { describe, expect, it } from 'vitest'

import { filterMasterClients } from '@/features/manual-booking/model/filter-master-clients'

const clients = [
  {
    id: '1',
    name: 'Оля',
    phone: '+375291112233',
    source: 'instagram' as const,
    socialHandle: 'olya.nails',
    visitsCount: 0,
    lastVisitAt: null,
  },
  {
    id: '2',
    name: 'Оксана',
    phone: '+375297776655',
    source: 'phone' as const,
    socialHandle: null,
    visitsCount: 0,
    lastVisitAt: null,
  },
]

describe('filterMasterClients', () => {
  it('filters by name substring', () => {
    expect(filterMasterClients('окс', clients).map((item) => item.id)).toEqual([
      '2',
    ])
  })

  it('filters by phone digits', () => {
    expect(filterMasterClients('29111', clients).map((item) => item.id)).toEqual(
      ['1'],
    )
  })

  it('filters by social handle', () => {
    expect(filterMasterClients('@olya', clients).map((item) => item.id)).toEqual(
      ['1'],
    )
  })

  it('returns nothing for an empty query', () => {
    expect(filterMasterClients('  ', clients)).toEqual([])
  })
})
