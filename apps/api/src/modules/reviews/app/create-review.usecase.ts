import { Inject, Injectable } from '@nestjs/common'
import type {
  CreateReviewInput,
  CreateReviewResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { autoModerateReview } from '@/modules/reviews/domain/auto-moderate-review'
import { toClientReviewView } from '@/modules/reviews/domain/map-review'
import { resolveCreateReview } from '@/modules/reviews/domain/review-eligibility'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateReviewInput,
  ): Promise<CreateReviewResponse> {
    const booking = await this.reviews.findBookingForReview(input.bookingId)

    if (!booking || booking.clientUserId !== currentUser.id) {
      throw DomainError.notFound('Запись не найдена')
    }

    const decision = resolveCreateReview({
      status: booking.status,
      completedAt: booking.completedAt,
      hasReview: booking.hasReview,
      now: this.clock.now(),
    })

    if (!decision.ok && decision.reason === 'already_reviewed') {
      throw DomainError.invalidState('Отзыв по этой записи уже оставлен')
    }

    if (!decision.ok && decision.reason === 'window_closed') {
      throw DomainError.invalidState('Срок на отзыв истёк')
    }

    if (!decision.ok) {
      throw DomainError.invalidState('Отзыв можно оставить только после визита')
    }

    const text = input.text?.trim() ? input.text.trim() : null
    const status = autoModerateReview(text)

    const review = await this.tx.run(async () => {
      return this.reviews.createReview({
        bookingId: booking.id,
        masterId: booking.masterId,
        clientUserId: currentUser.id,
        currentUserId: currentUser.id,
        rating: input.rating,
        text,
        status,
        now: this.clock.now(),
      })
    })

    return { review: toClientReviewView(review) }
  }
}
