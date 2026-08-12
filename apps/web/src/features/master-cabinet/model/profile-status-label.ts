import type { MasterProfileStatus } from '@lustra/contracts'

const LABELS: Record<MasterProfileStatus, string> = {
  draft: 'Черновик',
  pending_review: 'На проверке',
  published: 'Опубликован',
  hidden: 'Скрыт',
  banned: 'Заблокирован',
}

export function profileStatusLabel(status: MasterProfileStatus): string {
  return LABELS[status]
}
