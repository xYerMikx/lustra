import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { resolveReviewModeration } from '@/modules/admin-moderation/domain/resolve-review-moderation'

describe('resolveReviewModeration', () => {
  it('approves pending reviews to published', () => {
    expect(resolveReviewModeration('approve', 'pending_review')).toBe(
      'published',
    )
  })

  it('rejects pending reviews', () => {
    expect(resolveReviewModeration('reject', 'pending_review')).toBe('rejected')
  })

  it('hides pending or published reviews', () => {
    expect(resolveReviewModeration('hide', 'pending_review')).toBe('hidden')
    expect(resolveReviewModeration('hide', 'published')).toBe('hidden')
  })

  it('rejects illegal transitions', () => {
    expect(() => resolveReviewModeration('approve', 'published')).toThrow(
      DomainError,
    )
    expect(() => resolveReviewModeration('hide', 'hidden')).toThrow(DomainError)
  })
})
