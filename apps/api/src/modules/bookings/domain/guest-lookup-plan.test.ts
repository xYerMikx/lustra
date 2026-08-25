import { describe, expect, it } from 'vitest'

import { guestLookupPlan, normalizeGuestHandle } from '@/modules/bookings/domain/guest-lookup-plan'

describe('normalizeGuestHandle', () => {
  it('strips @ and lowercases', () => {
    expect(normalizeGuestHandle('@Olya.Nails')).toBe('olya.nails')
  })
})

describe('guestLookupPlan', () => {
  it('looks up phone first, then the social network', () => {
    expect(
      guestLookupPlan({
        phone: '+375291112233',
        identityNetwork: 'instagram',
        socialHandle: '@Olya.nails',
      }),
    ).toEqual([
      { by: 'phone', phone: '+375291112233' },
      { by: 'instagram', handle: 'olya.nails' },
    ])
  })

  it('skips phone when it is missing', () => {
    expect(
      guestLookupPlan({
        phone: null,
        identityNetwork: 'telegram',
        socialHandle: 'olya_tg',
      }),
    ).toEqual([{ by: 'telegram', handle: 'olya_tg' }])
  })
})
