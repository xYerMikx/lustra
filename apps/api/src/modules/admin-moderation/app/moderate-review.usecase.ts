import { Injectable } from '@nestjs/common'
import type {
  ModerateReviewInput,
  ModerateReviewResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { REVIEW_MODERATE_AUDIT_ACTION } from '@/common/events/audit-action-type'
import { DomainError } from '@/common/errors/domain-error'
import { assertAdmin } from '@/modules/admin-moderation/domain/assert-admin'
import { toAdminReviewCard } from '@/modules/admin-moderation/domain/map-admin-queue'
import { resolveReviewModeration } from '@/modules/admin-moderation/domain/resolve-review-moderation'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ModerateReviewUseCase {
  constructor(private readonly store: AdminModerationRepository) {}

  async execute(
    currentUser: AuthUser,
    reviewId: string,
    input: ModerateReviewInput,
    meta: { ip?: string } = {},
  ): Promise<ModerateReviewResponse> {
    assertAdmin(currentUser)

    const current = await this.store.findReviewById(reviewId)

    if (!current) {
      throw new DomainError('NOT_FOUND', 'Отзыв не найден')
    }

    const nextStatus = resolveReviewModeration(input.action, current.status)
    const updated = await this.store.updateReviewStatus(
      reviewId,
      nextStatus,
      new Date(),
    )

    await this.store.writeAuditLog({
      currentUserId: currentUser.id,
      action: REVIEW_MODERATE_AUDIT_ACTION[input.action],
      entity: 'Review',
      entityId: reviewId,
      ip: meta.ip,
      payload: {
        comment: input.comment ?? null,
        fromStatus: current.status,
        toStatus: nextStatus,
      },
    })

    return { review: toAdminReviewCard(updated) }
  }
}
