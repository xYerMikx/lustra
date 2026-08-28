import { afterEach, describe, expect, it } from 'vitest'

import { landingUrl } from '@/shared/lib/landing-url'

const KEYS = ['NEXT_PUBLIC_SITE_URL', 'PUBLIC_SITE_URL'] as const

describe('landingUrl', () => {
  afterEach(() => {
    for (const key of KEYS) {
      delete process.env[key]
    }
  })

  it('points home at the marketing origin with a trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://lumira.by'

    expect(landingUrl()).toBe('https://lumira.by/')
    expect(landingUrl('/')).toBe('https://lumira.by/')
  })

  it('normalizes inner paths', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://lumira.by'

    expect(landingUrl('/for-masters')).toBe('https://lumira.by/for-masters/')
    expect(landingUrl('for-masters/')).toBe('https://lumira.by/for-masters/')
  })
})
