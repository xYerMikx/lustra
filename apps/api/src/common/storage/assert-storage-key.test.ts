import { describe, expect, it } from 'vitest'

import { assertStorageKey } from '@/common/storage/assert-storage-key'

describe('assertStorageKey', () => {
  it('accepts a nested object key', () => {
    expect(
      assertStorageKey('11111111-1111-4111-8111-111111111111/a.webp'),
    ).toBe('11111111-1111-4111-8111-111111111111/a.webp')
  })

  it('rejects traversal and absolute keys', () => {
    expect(() => assertStorageKey('../secret')).toThrow('Invalid media storage key')
    expect(() => assertStorageKey('/etc/passwd')).toThrow('Invalid media storage key')
    expect(() => assertStorageKey('a//b.webp')).toThrow('Invalid media storage key')
  })
})
