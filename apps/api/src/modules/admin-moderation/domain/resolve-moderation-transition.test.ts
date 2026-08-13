import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { resolveModerationTransition } from '@/modules/admin-moderation/domain/resolve-moderation-transition'

describe('resolveModerationTransition', () => {
  it('approves pending_review to published', () => {
    expect(resolveModerationTransition('approve', 'pending_review')).toEqual({
      nextStatus: 'published',
      setPublishedAt: true,
    })
  })

  it('rejects pending_review to draft', () => {
    expect(resolveModerationTransition('reject', 'pending_review')).toEqual({
      nextStatus: 'draft',
      setPublishedAt: false,
    })
  })

  it('hides published and pending_review', () => {
    expect(resolveModerationTransition('hide', 'published').nextStatus).toBe(
      'hidden',
    )
    expect(
      resolveModerationTransition('hide', 'pending_review').nextStatus,
    ).toBe('hidden')
  })

  it('bans non-banned statuses', () => {
    expect(resolveModerationTransition('ban', 'draft').nextStatus).toBe(
      'banned',
    )
    expect(resolveModerationTransition('ban', 'published').nextStatus).toBe(
      'banned',
    )
  })

  it('rejects illegal transitions', () => {
    expect(() => resolveModerationTransition('approve', 'draft')).toThrow(
      DomainError,
    )
    expect(() => resolveModerationTransition('ban', 'banned')).toThrow(
      DomainError,
    )
  })
})
