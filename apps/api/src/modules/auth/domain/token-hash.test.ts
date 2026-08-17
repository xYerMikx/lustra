import { describe, expect, it } from 'vitest'

import { generateRefreshToken, hashToken } from './token-hash'

describe('hashToken', () => {
  it('returns stable sha256 hex for the same input', () => {
    const a = hashToken('refresh-token-value')
    const b = hashToken('refresh-token-value')
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })

  it('differs for different inputs', () => {
    expect(hashToken('a')).not.toBe(hashToken('b'))
  })
})

describe('generateRefreshToken', () => {
  it('returns opaque base64url strings of sufficient length', () => {
    const token = generateRefreshToken()
    expect(token.length).toBeGreaterThanOrEqual(40)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})
