import { Injectable } from '@nestjs/common'
import type {
  AdminListReviewsQuery,
  AdminListReviewsResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { assertAdmin } from '@/modules/admin-moderation/domain/assert-admin'
import { toAdminReviewCard } from '@/modules/admin-moderation/domain/map-admin-queue'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Injectable()
export class ListAdminReviewsUseCase {
  constructor(private readonly store: AdminModerationRepository) {}

  async execute(
    currentUser: AuthUser,
    query: AdminListReviewsQuery,
  ): Promise<AdminListReviewsResponse> {
    assertAdmin(currentUser)

    const rows = await this.store.listReviewsByStatus(query.status, query.limit)

    return { items: rows.map(toAdminReviewCard) }
  }
}
