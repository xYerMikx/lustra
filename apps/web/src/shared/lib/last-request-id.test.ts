import { afterEach, describe, expect, it } from 'vitest'

import {
  clearLastRequestId,
  readLastRequestId,
  rememberRequestId,
} from '@/shared/lib/last-request-id'

afterEach(() => {
  clearLastRequestId()
})

describe('last request id', () => {
  it('ignores empty values', () => {
    rememberRequestId(undefined)
    rememberRequestId('')

    expect(readLastRequestId()).toBeUndefined()
  })

  it('remembers the latest request id', () => {
    rememberRequestId('req-1')
    rememberRequestId('req-2')

    expect(readLastRequestId()).toBe('req-2')
  })

  it('clears the stored request id', () => {
    rememberRequestId('req-3')
    clearLastRequestId()

    expect(readLastRequestId()).toBeUndefined()
  })
})
