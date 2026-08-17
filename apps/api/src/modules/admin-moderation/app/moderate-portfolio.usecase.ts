import { Injectable } from '@nestjs/common'
import type {
  ModeratePortfolioInput,
  ModeratePortfolioResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { PORTFOLIO_MODERATE_AUDIT_ACTION } from '@/common/events/audit-action-type'
import { DomainError } from '@/common/errors/domain-error'
import { assertAdmin } from '@/modules/admin-moderation/domain/assert-admin'
import { toAdminPortfolioCard } from '@/modules/admin-moderation/domain/map-admin-queue'
import { resolvePortfolioModeration } from '@/modules/admin-moderation/domain/resolve-portfolio-moderation'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ModeratePortfolioUseCase {
  constructor(private readonly store: AdminModerationRepository) {}

  async execute(
    currentUser: AuthUser,
    itemId: string,
    input: ModeratePortfolioInput,
    meta: { ip?: string } = {},
  ): Promise<ModeratePortfolioResponse> {
    assertAdmin(currentUser)

    const current = await this.store.findPortfolioById(itemId)

    if (!current) {
      throw new DomainError('NOT_FOUND', 'Фото не найдено')
    }

    const nextStatus = resolvePortfolioModeration(
      input.action,
      current.media.moderation,
    )
    const updated = await this.store.updatePortfolioModeration(
      itemId,
      nextStatus,
    )

    await this.store.writeAuditLog({
      currentUserId: currentUser.id,
      action: PORTFOLIO_MODERATE_AUDIT_ACTION[input.action],
      entity: 'PortfolioItem',
      entityId: itemId,
      ip: meta.ip,
      payload: {
        comment: input.comment ?? null,
        fromStatus: current.media.moderation,
        toStatus: nextStatus,
      },
    })

    return { item: toAdminPortfolioCard(updated) }
  }
}
