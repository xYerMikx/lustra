import { describe, expect, it } from 'vitest'

import { matchMasterClient } from '@/features/master-calendar/model/match-master-client'

const clients = [
  {
    id: '1',
    name: 'Оля',
    phone: '+375291112233',
    source: 'instagram' as const,
    socialHandle: null,
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

describe('matchMasterClient', () => {
  it('matches a unique exact name', () => {
    expect(matchMasterClient('оля', clients)?.phone).toBe('+375291112233')
  })

  it('matches a unique prefix', () => {
    expect(matchMasterClient('Окс', clients)?.id).toBe('2')
  })

  it('returns null when several names share a prefix', () => {
    expect(matchMasterClient('О', clients)).toBeNull()
  })
})
