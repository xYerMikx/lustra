import { Inject, Injectable } from '@nestjs/common'
import type { PublicReviewListResponse } from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { toPublicReviewView } from '@/modules/reviews/domain/map-review'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class ListPublicReviewsUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
  ) {}

  async execute(slug: string): Promise<PublicReviewListResponse> {
    const masterId = await this.reviews.findPublicMasterIdBySlug(slug)

    if (!masterId) {
      throw DomainError.notFound('Мастер не найден')
    }

    const items = await this.reviews.listPublishedByMasterId(masterId)

    return { items: items.map(toPublicReviewView) }
  }
}
