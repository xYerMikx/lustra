import { describe, expect, it } from 'vitest'

import { createProfileQrSvg } from '@/features/master-cabinet/model/create-profile-qr'

describe('createProfileQrSvg', () => {
  it('renders an svg for the profile url', async () => {
    const svg = await createProfileQrSvg(
      'http://localhost:3000/m/anna-nails?utm_source=qr',
    )

    expect(svg).toContain('<svg')
  })
})
