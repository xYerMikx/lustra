import { describe, expect, it } from 'vitest'

import { shouldAttemptSessionRefresh } from '@/shared/api/session-refresh'

describe('shouldAttemptSessionRefresh', () => {
  it('retries once on 401 for protected routes', () => {
    expect(shouldAttemptSessionRefresh('/auth/me', 401, false)).toBe(true)
    expect(shouldAttemptSessionRefresh('/master/profile', 401, false)).toBe(true)
  })

  it('skips auth endpoints and already-retried calls', () => {
    expect(shouldAttemptSessionRefresh('/auth/refresh', 401, false)).toBe(false)
    expect(shouldAttemptSessionRefresh('/auth/login', 401, false)).toBe(false)
    expect(shouldAttemptSessionRefresh('/auth/me', 401, true)).toBe(false)
    expect(shouldAttemptSessionRefresh('/auth/me', 403, false)).toBe(false)
  })
})
