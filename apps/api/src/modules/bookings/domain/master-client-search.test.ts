import { describe, expect, it } from 'vitest'

import {
  clientMatchesQuery,
  clientsVisibleToMaster,
  handleNeedleFromQuery,
} from '@/modules/bookings/domain/master-client-search'

const anna = {
  masterId: 'm-own',
  name: 'Анна',
  phone: '+375291112233',
  note: 'из директа',
  instagramHandle: 'anna.nails',
  telegramHandle: null,
}

const otherMasterAnna = {
  ...anna,
  masterId: 'm-other',
  instagramHandle: 'anna.nails',
}

describe('master client search', () => {
  it('strips leading @ from handle queries', () => {
    expect(handleNeedleFromQuery('@anna.nails')).toBe('anna.nails')
    expect(handleNeedleFromQuery('  @@Olya ')).toBe('Olya')
  })

  it('matches a client by @nick on instagram or telegram', () => {
    expect(clientMatchesQuery(anna, '@anna.nails')).toBe(true)
    expect(
      clientMatchesQuery(
        { ...anna, instagramHandle: null, telegramHandle: 'anna_tg' },
        '@anna_tg',
      ),
    ).toBe(true)
    expect(clientMatchesQuery(anna, '@missing')).toBe(false)
  })

  it('returns an empty list for another masterId (IDOR)', () => {
    expect(
      clientsVisibleToMaster([anna, otherMasterAnna], 'm-own', '@anna.nails'),
    ).toEqual([anna])
    expect(
      clientsVisibleToMaster([anna, otherMasterAnna], 'm-stranger', '@anna.nails'),
    ).toEqual([])
  })
})
