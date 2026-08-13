import type { MediaModerationStatus } from '@lustra/contracts'

export function portfolioModerationLabel(
  status: MediaModerationStatus,
): string | null {
  if (status === 'pending') {
    return 'На проверке'
  }

  if (status === 'rejected') {
    return 'Отклонено'
  }

  return null
}
