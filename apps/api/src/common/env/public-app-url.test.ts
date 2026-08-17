import { describe, expect, it } from 'vitest'

import { publicAppUrl } from '@/common/env/public-app-url'

describe('publicAppUrl', () => {
  it('strips a trailing slash from PUBLIC_APP_URL', () => {
    const previous = process.env.PUBLIC_APP_URL
    process.env.PUBLIC_APP_URL = 'https://lustra.by/'

    try {
      expect(publicAppUrl()).toBe('https://lustra.by')
    } finally {
      if (previous === undefined) {
        delete process.env.PUBLIC_APP_URL
      } else {
        process.env.PUBLIC_APP_URL = previous
      }
    }
  })
})
