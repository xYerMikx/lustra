import { describe, expect, it } from 'vitest'

import { DomainError } from '../../../common/errors/domain-error'
import { assertPasswordPolicy } from './password-policy'

describe('assertPasswordPolicy', () => {
  it('accepts passwords with at least 8 characters', () => {
    expect(() => assertPasswordPolicy('12345678')).not.toThrow()
  })

  it('rejects short passwords with VALIDATION_FAILED', () => {
    try {
      assertPasswordPolicy('short')
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError)
      expect((error as DomainError).code).toBe('VALIDATION_FAILED')
    }
  })
})
