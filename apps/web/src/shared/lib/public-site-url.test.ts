import { afterEach, describe, expect, it } from 'vitest'

import { publicSiteUrl } from '@/shared/lib/public-site-url'

const KEYS = ['NEXT_PUBLIC_SITE_URL', 'PUBLIC_SITE_URL'] as const

describe('publicSiteUrl', () => {
  afterEach(() => {
    for (const key of KEYS) {
      delete process.env[key]
    }
  })

  it('falls back to lumira.by', () => {
    for (const key of KEYS) {
      delete process.env[key]
    }

    expect(publicSiteUrl()).toBe('https://lumira.by')
  })

  it('strips a trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://lumira.by/'

    expect(publicSiteUrl()).toBe('https://lumira.by')
  })
})
