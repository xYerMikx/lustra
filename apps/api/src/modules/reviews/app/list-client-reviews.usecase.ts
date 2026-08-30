import { Inject, Injectable } from '@nestjs/common'
import type { ReceivedClientReviewListResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { toReceivedClientReviewView } from '@/modules/reviews/domain/map-review'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class ListClientReviewsUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
  ) {}

  async execute(
    currentUser: AuthUser,
  ): Promise<ReceivedClientReviewListResponse> {
    const [items, rating] = await Promise.all([
      this.reviews.listReceivedByClientUserId(currentUser.id),
      this.reviews.findClientRating(currentUser.id),
    ])

    return {
      ratingAvg: rating.ratingAvg,
      ratingCount: rating.ratingCount,
      items: items.map(toReceivedClientReviewView),
    }
  }
}