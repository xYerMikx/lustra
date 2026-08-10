import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { assertPasswordPolicy } from '@/modules/auth/domain/password-policy'

describe('assertPasswordPolicy', () => {
  it('accepts passwords of at least 8 characters', () => {
    expect(() => assertPasswordPolicy('Password1')).not.toThrow()
  })

  it('rejects short passwords', () => {
    expect(() => assertPasswordPolicy('short')).toThrow(DomainError)
  })
})
