import type { MediaModerationStatus, ModeratePortfolioAction } from '@lumira/contracts'

import { DomainError } from '@/common/errors/domain-error'

export function resolvePortfolioModeration(
  action: ModeratePortfolioAction,
  current: MediaModerationStatus,
): MediaModerationStatus {
  if (action === 'approve') {
    if (current !== 'pending') {
      throw new DomainError(
        'INVALID_STATE',
        'Одобрить можно только фото на проверке',
      )
    }

    return 'approved'
  }

  if (current === 'rejected') {
    throw new DomainError('INVALID_STATE', 'Фото уже отклонено')
  }

  return 'rejected'
}
