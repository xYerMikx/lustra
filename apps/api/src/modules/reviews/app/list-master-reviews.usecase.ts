import { Inject, Injectable } from '@nestjs/common'
import type { MasterReviewListResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { toMasterReviewView } from '@/modules/reviews/domain/map-review'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class ListMasterReviewsUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
  ) {}

  async execute(currentUser: AuthUser): Promise<MasterReviewListResponse> {
    const masterId = await this.reviews.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const items = await this.reviews.listForMaster(masterId)

    return { items: items.map(toMasterReviewView) }
  }
}
