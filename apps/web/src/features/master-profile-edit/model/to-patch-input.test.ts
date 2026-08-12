import { describe, expect, it } from 'vitest'

import { buildPublicProfilePath, buildPublicProfileUrl } from '@/features/master-cabinet/model/public-profile-url'
import { toPatchMasterProfileInput } from '@/features/master-profile-edit/model/to-patch-input'

describe('public profile url', () => {
  it('builds path and absolute url', () => {
    expect(buildPublicProfilePath('anna-nails')).toBe('/m/anna-nails')
    expect(buildPublicProfileUrl('anna-nails', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/m/anna-nails',
    )
  })
})

describe('toPatchMasterProfileInput', () => {
  it('maps empty optional strings to null', () => {
    expect(
      toPatchMasterProfileInput({
        displayName: 'Anna',
        slug: 'anna-nails',
        headline: '',
        bio: '',
        districtId: '11111111-1111-1111-1111-111111111111',
        locationType: 'salon',
        addressHint: '',
      }),
    ).toEqual({
      displayName: 'Anna',
      slug: 'anna-nails',
      headline: null,
      bio: null,
      districtId: '11111111-1111-1111-1111-111111111111',
      locationType: 'salon',
      addressHint: null,
    })
  })
})
