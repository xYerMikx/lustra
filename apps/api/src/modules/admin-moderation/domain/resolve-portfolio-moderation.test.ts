import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { resolvePortfolioModeration } from '@/modules/admin-moderation/domain/resolve-portfolio-moderation'

describe('resolvePortfolioModeration', () => {
  it('approves pending media', () => {
    expect(resolvePortfolioModeration('approve', 'pending')).toBe('approved')
  })

  it('rejects pending or approved media', () => {
    expect(resolvePortfolioModeration('reject', 'pending')).toBe('rejected')
    expect(resolvePortfolioModeration('reject', 'approved')).toBe('rejected')
  })

  it('rejects illegal transitions', () => {
    expect(() => resolvePortfolioModeration('approve', 'approved')).toThrow(
      DomainError,
    )
    expect(() => resolvePortfolioModeration('reject', 'rejected')).toThrow(
      DomainError,
    )
  })
})
