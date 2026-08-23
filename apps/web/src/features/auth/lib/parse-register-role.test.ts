import { describe, expect, it } from 'vitest'

import { parseRegisterRole } from '@/features/auth/lib/parse-register-role'

describe('parseRegisterRole', () => {
  it('reads master from the landing query', () => {
    expect(parseRegisterRole('master')).toBe('master')
  })

  it('reads client from the query', () => {
    expect(parseRegisterRole('client')).toBe('client')
  })

  it('falls back to client for missing or unknown values', () => {
    expect(parseRegisterRole(null)).toBe('client')
    expect(parseRegisterRole('admin')).toBe('client')
  })
})
