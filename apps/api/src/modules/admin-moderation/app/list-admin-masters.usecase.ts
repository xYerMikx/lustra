import { Injectable } from '@nestjs/common'
import type {
  AdminListMastersQuery,
  AdminListMastersResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { toAdminMasterCard } from '@/modules/admin-moderation/domain/map-admin-master'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ListAdminMastersUseCase {
  constructor(private readonly masters: AdminModerationRepository) {}

  async execute(
    actor: AuthUser,
    query: AdminListMastersQuery,
  ): Promise<AdminListMastersResponse> {
    if (actor.role !== 'admin') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const rows = await this.masters.listByStatus(query.status, query.limit)

    return {
      items: rows.map(toAdminMasterCard),
    }
  }
}
