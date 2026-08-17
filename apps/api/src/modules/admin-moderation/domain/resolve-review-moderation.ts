import type { ModerateReviewAction, ReviewStatus } from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'

export function resolveReviewModeration(
  action: ModerateReviewAction,
  current: ReviewStatus,
): ReviewStatus {
  if (action === 'approve') {
    if (current !== 'pending_review') {
      throw new DomainError(
        'INVALID_STATE',
        'Одобрить можно только отзыв на проверке',
      )
    }

    return 'published'
  }

  if (action === 'reject') {
    if (current !== 'pending_review') {
      throw new DomainError(
        'INVALID_STATE',
        'Отклонить можно только отзыв на проверке',
      )
    }

    return 'rejected'
  }

  if (current === 'hidden' || current === 'rejected') {
    throw new DomainError('INVALID_STATE', 'Отзыв уже скрыт или отклонён')
  }

  return 'hidden'
}
