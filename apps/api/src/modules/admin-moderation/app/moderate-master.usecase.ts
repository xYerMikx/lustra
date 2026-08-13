import { Injectable } from '@nestjs/common'
import type {
  ModerateMasterInput,
  ModerateMasterResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { MASTER_MODERATE_AUDIT_ACTION } from '@/common/events/audit-action-type'
import { DomainError } from '@/common/errors/domain-error'
import { toAdminMasterCard } from '@/modules/admin-moderation/domain/map-admin-master'
import { resolveModerationTransition } from '@/modules/admin-moderation/domain/resolve-moderation-transition'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ModerateMasterUseCase {
  constructor(private readonly masters: AdminModerationRepository) {}

  async execute(
    currentUser: AuthUser,
    masterId: string,
    input: ModerateMasterInput,
    meta: { ip?: string } = {},
  ): Promise<ModerateMasterResponse> {
    if (currentUser.role !== 'admin') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const current = await this.masters.findById(masterId)

    if (!current) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const transition = resolveModerationTransition(input.action, current.status)

    const updated = await this.masters.updateStatus(masterId, {
      status: transition.nextStatus,
      publishedAt: transition.setPublishedAt ? new Date() : undefined,
    })

    await this.masters.writeAuditLog({
      currentUserId: currentUser.id,
      action: MASTER_MODERATE_AUDIT_ACTION[input.action],
      entity: 'MasterProfile',
      entityId: masterId,
      ip: meta.ip,
      payload: {
        comment: input.comment ?? null,
        fromStatus: current.status,
        toStatus: transition.nextStatus,
      },
    })

    return {
      master: toAdminMasterCard(updated),
    }
  }
}
