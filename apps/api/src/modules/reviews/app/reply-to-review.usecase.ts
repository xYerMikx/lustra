import { Inject, Injectable } from '@nestjs/common'
import type {
  ReplyToReviewInput,
  ReplyToReviewResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { toMasterReviewView } from '@/modules/reviews/domain/map-review'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class ReplyToReviewUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    reviewId: string,
    input: ReplyToReviewInput,
  ): Promise<ReplyToReviewResponse> {
    const masterId = await this.reviews.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const existing = await this.reviews.findById(reviewId)

    if (!existing || existing.masterId !== masterId) {
      throw DomainError.notFound('Отзыв не найден')
    }

    if (existing.status !== 'published' || existing.masterReply) {
      throw DomainError.invalidState('Ответить можно один раз на опубликованный отзыв')
    }

    const review = await this.tx.run(async () => {
      return this.reviews.replyToReview({
        reviewId,
        masterId,
        text: input.text,
        now: this.clock.now(),
      })
    })

    if (!review) {
      throw DomainError.invalidState('Ответить можно один раз на опубликованный отзыв')
    }

    return { review: toMasterReviewView(review) }
  }
}
