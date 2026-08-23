import { OutboxEventType } from '@/common/events/outbox-event-type'
import type { CreateReviewStoreInput } from '@/modules/reviews/app/reviews.ports'
import { bayesianRating } from '@/modules/reviews/domain/bayesian-rating'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'
import {
  REVIEW_SELECT,
  mapReviewRow,
  type TxClient,
} from '@/modules/reviews/infra/map-review-row'

function publishedRatings(rows: Array<{ rating: number | null }>): number[] {
  const ratings: number[] = []

  for (const row of rows) {
    if (row.rating != null) {
      ratings.push(row.rating)
    }
  }

  return ratings
}

export async function recalculateMasterRatingInStore(
  db: TxClient,
  masterId: string,
  now: Date,
): Promise<void> {
  const published = await db.review.findMany({
    where: {
      masterId,
      authorRole: 'client',
      status: 'published',
    },
    select: { rating: true },
  })

  const result = bayesianRating(publishedRatings(published))

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

export async function recalculateClientRatingInStore(
  db: TxClient,
  clientUserId: string,
  now: Date,
): Promise<void> {
  const published = await db.review.findMany({
    where: {
      clientUserId,
      authorRole: 'master',
      status: 'published',
    },
    select: { rating: true },
  })

  const result = bayesianRating(publishedRatings(published))

  await db.clientProfile.updateMany({
    where: { userId: clientUserId },
    data: {
      ratingAvg: result.avg.toFixed(2),
      ratingCount: result.count,
      updatedAt: now,
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
      authorRole: input.authorRole,
      serviceTitle: input.serviceTitle,
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
        authorRole: input.authorRole,
        rating: input.rating,
        status: input.status,
        currentUserId: input.currentUserId,
      },
    },
  })

  if (input.status === 'published') {
    if (input.authorRole === 'client') {
      await recalculateMasterRatingInStore(db, input.masterId, input.now)
    } else {
      await recalculateClientRatingInStore(db, input.clientUserId, input.now)
    }
  }

  return mapReviewRow(created)
}