import type { ReviewAuthorRole } from '@lumira/contracts'

import { joinDotLabels } from '@/shared/lib/join-dot-labels'

export function formatAdminReviewHeadline(input: {
  authorRole: ReviewAuthorRole
  rating: number | null
  clientFirstName: string
}): string {
  const subject = input.authorRole === 'master' ? 'О клиенте' : 'О мастере'
  const ratingLabel =
    input.rating != null ? `${input.rating} из 5` : 'без оценки'

  return joinDotLabels([subject, ratingLabel, input.clientFirstName])
}

export function formatAdminReviewMeta(input: {
  serviceTitle: string
  masterDisplayName: string
}): string {
  return joinDotLabels([input.serviceTitle, input.masterDisplayName])
}
