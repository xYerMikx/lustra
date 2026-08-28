import { describe, expect, it } from 'vitest'

import {
  DEFAULT_OG_IMAGE,
  listOgImageSpecs,
  ogImageForPath,
} from '@/lib/og-pages'

describe('ogImageForPath', () => {
  it('returns the Belarus home card for the index and unknown routes', () => {
    expect(ogImageForPath('/')).toEqual(DEFAULT_OG_IMAGE)
    expect(ogImageForPath('')).toEqual(DEFAULT_OG_IMAGE)
    expect(ogImageForPath('/unknown')).toEqual(DEFAULT_OG_IMAGE)
    expect(DEFAULT_OG_IMAGE.tagline).toContain('Беларуси')
    expect(DEFAULT_OG_IMAGE.tagline).not.toContain('Минск')
  })

  it('picks a unique card per landing page, ignoring a trailing slash', () => {
    expect(ogImageForPath('/for-masters/').path).toBe('/og-for-masters.png')
    expect(ogImageForPath('/services').path).toBe('/og-services.png')
    expect(ogImageForPath('/contacts/').alt).toContain('контакты')
    expect(ogImageForPath('/payment').tagline).toBe('оплата и возврат')
    expect(ogImageForPath('/privacy').path).toBe('/og-privacy.png')
    expect(ogImageForPath('/terms').path).toBe('/og-terms.png')
  })

  it('keeps every generated card on a distinct file and tagline', () => {
    const specs = listOgImageSpecs()
    const paths = specs.map((item) => item.path)
    const taglines = specs.map((item) => item.tagline)

    expect(new Set(paths).size).toBe(paths.length)
    expect(new Set(taglines).size).toBe(taglines.length)
    expect(specs.length).toBeGreaterThanOrEqual(7)
  })
})
