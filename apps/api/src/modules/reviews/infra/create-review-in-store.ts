import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { CreateReviewStoreInput } from '@/modules/reviews/app/reviews.ports'
import { bayesianRating } from '@/modules/reviews/domain/bayesian-rating'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'
import {
  REVIEW_SELECT,
  mapReviewRow,
  type TxClient,
} from '@/modules/reviews/infra/map-review-row'

export async function recalculateMasterRatingInStore(
  db: TxClient,
  masterId: string,
  now: Date,
): Promise<void> {
  const published = await db.review.findMany({
    where: { masterId, status: 'published' },
    select: { rating: true },
  })

  const result = bayesianRating(published.map((row) => row.rating))

  await db.masterStats.upsert({
    where: { masterId },
    create: {
      masterId,
      ratingAvg: result.avg.toFixed(2),
      ratingCount: result.count,
      ratingHistogram: result.histogram,
      recalculatedAt: now,
    },
    update: {
      ratingAvg: result.avg.toFixed(2),
      ratingCount: result.count,
      ratingHistogram: result.histogram,
      recalculatedAt: now,
    },
  })
}

export async function createReviewInStore(
  db: TxClient,
  input: CreateReviewStoreInput,
): Promise<ReviewRecord> {
  const created = await db.review.create({
    data: {
      bookingId: input.bookingId,
      masterId: input.masterId,
      clientUserId: input.clientUserId,
      rating: input.rating,
      text: input.text,
      status: input.status,
    },
    select: REVIEW_SELECT,
  })

  const outboxType =
    input.status === 'published'
      ? OutboxEventType.ReviewPublished
      : OutboxEventType.ReviewCreated

  await db.outboxEvent.create({
    data: {
      type: outboxType,
      aggregate: `review:${created.id}`,
      payload: {
        reviewId: created.id,
        bookingId: input.bookingId,
        masterId: input.masterId,
        rating: input.rating,
        status: input.status,
        currentUserId: input.currentUserId,
      },
    },
  })

  if (input.status === 'published') {
    await recalculateMasterRatingInStore(db, input.masterId, input.now)
  }

  return mapReviewRow(created)
}
