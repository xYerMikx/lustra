import { Injectable } from '@nestjs/common'
import type {
  AdminListPortfolioQuery,
  AdminListPortfolioResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { assertAdmin } from '@/modules/admin-moderation/domain/assert-admin'
import { toAdminPortfolioCard } from '@/modules/admin-moderation/domain/map-admin-queue'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ListAdminPortfolioUseCase {
  constructor(private readonly store: AdminModerationRepository) {}

  async execute(
    currentUser: AuthUser,
    query: AdminListPortfolioQuery,
  ): Promise<AdminListPortfolioResponse> {
    assertAdmin(currentUser)

    const rows = await this.store.listPortfolioByModeration(
      query.status,
      query.limit,
    )

    return { items: rows.map(toAdminPortfolioCard) }
  }
}
