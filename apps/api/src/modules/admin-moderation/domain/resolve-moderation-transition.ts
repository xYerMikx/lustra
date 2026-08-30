import type { MasterProfileStatus, ModerateMasterAction } from '@lumira/contracts'

import { DomainError } from '@/common/errors/domain-error'

export type ModerationTransition = {
  nextStatus: MasterProfileStatus
  setPublishedAt: boolean
}

export function resolveModerationTransition(
  action: ModerateMasterAction,
  currentStatus: MasterProfileStatus,
): ModerationTransition {
  if (action === 'approve') {
    if (currentStatus !== 'pending_review') {
      throwInvalid('Одобрить можно только профиль на проверке')
    }

    return { nextStatus: 'published', setPublishedAt: true }
  }

  if (action === 'reject') {
    if (currentStatus !== 'pending_review') {
      throwInvalid('Отклонить можно только профиль на проверке')
    }

    return { nextStatus: 'draft', setPublishedAt: false }
  }

  if (action === 'hide') {
    if (currentStatus !== 'published' && currentStatus !== 'pending_review') {
      throwInvalid('Скрыть можно опубликованный профиль или профиль на проверке')
    }

    return { nextStatus: 'hidden', setPublishedAt: false }
  }

  if (currentStatus === 'banned') {
    throwInvalid('Профиль уже заблокирован')
  }

  return { nextStatus: 'banned', setPublishedAt: false }
}

function throwInvalid(message: string): never {
  throw new DomainError('INVALID_STATE', message)
}
