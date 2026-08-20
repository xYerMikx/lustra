import { describe, expect, it } from 'vitest'

import { toClientSocialLink } from '@/features/booking-cabinets/model/to-client-social-link'

describe('toClientSocialLink', () => {
  it('builds an Instagram profile link from handle and source', () => {
    expect(
      toClientSocialLink({
        socialHandle: '@anna.nails',
        source: 'instagram',
      }),
    ).toEqual({
      network: 'instagram',
      handle: 'anna.nails',
      href: 'https://instagram.com/anna.nails',
      label: '@anna.nails',
    })
  })

  it('builds a Telegram link from the booking channel', () => {
    expect(
      toClientSocialLink({
        socialHandle: 'anna_nails',
        source: 'phone',
        channel: 'telegram',
      }),
    ).toEqual({
      network: 'telegram',
      handle: 'anna_nails',
      href: 'https://t.me/anna_nails',
      label: '@anna_nails',
    })
  })

  it('returns null when the network is unknown', () => {
    expect(
      toClientSocialLink({
        socialHandle: 'anna.nails',
        source: 'phone',
        channel: 'walk_in',
      }),
    ).toBeNull()
  })
})
