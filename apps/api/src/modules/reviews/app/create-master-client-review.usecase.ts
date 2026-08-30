import { Inject, Injectable } from '@nestjs/common'
import type {
  CreateMasterClientReviewInput,
  CreateMasterClientReviewResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { isDevelopment } from '@/common/env/is-production'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { autoModerateReview } from '@/modules/reviews/domain/auto-moderate-review'
import { toReceivedClientReviewView } from '@/modules/reviews/domain/map-review'
import { resolveCreateReview } from '@/modules/reviews/domain/review-eligibility'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Injectable()
export class CreateMasterClientReviewUseCase {
  constructor(
    @Inject(ReviewRepository)
    private readonly reviews: ReviewStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateMasterClientReviewInput,
  ): Promise<CreateMasterClientReviewResponse> {
    const masterId = await this.reviews.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const booking = await this.reviews.findBookingForReview(input.bookingId)

    if (!booking || booking.masterId !== masterId) {
      throw DomainError.notFound('Запись не найдена')
    }

    const clientUserId = booking.clientUserId

    if (!clientUserId) {
      throw DomainError.invalidState(
        'Отзыв можно оставить только клиенту с аккаунтом',
      )
    }

    const decision = resolveCreateReview({
      status: booking.status,
      completedAt: booking.completedAt,
      hasReview: booking.hasMasterReview,
      now: this.clock.now(),
      relaxTimeGuards: isDevelopment,
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
    const rating = input.rating ?? null
    const status = autoModerateReview(text)

    const review = await this.tx.run(async () => {
      return this.reviews.createReview({
        bookingId: booking.id,
        masterId: booking.masterId,
        clientUserId,
        currentUserId: currentUser.id,
        authorRole: 'master',
        serviceTitle: booking.serviceTitle,
        rating,
        text,
        status,
        now: this.clock.now(),
      })
    })

    return { review: toReceivedClientReviewView(review) }
  }
}