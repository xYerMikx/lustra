import { describe, expect, it } from 'vitest'

import {
  buildPublicProfilePath,
  buildPublicProfileUrl,
  buildQrProfileUrl,
} from '@/features/master-cabinet/model/public-profile-url'

describe('public profile urls', () => {
  it('builds the path and absolute url', () => {
    expect(buildPublicProfilePath('anna-nails')).toBe('/m/anna-nails')
    expect(buildPublicProfileUrl('anna-nails', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/m/anna-nails',
    )
  })

  it('tags the QR url with utm_source=qr', () => {
    expect(buildQrProfileUrl('anna-nails', 'http://localhost:3000/')).toBe(
      'http://localhost:3000/m/anna-nails?utm_source=qr',
    )
  })
})
