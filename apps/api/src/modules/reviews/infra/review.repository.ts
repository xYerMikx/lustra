import { Prisma, type BookingStatus as PrismaBookingStatus } from '@lumira/db'
import { Injectable } from '@nestjs/common'
import type { BookingStatus } from '@lumira/contracts'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  CreateReviewStoreInput,
  ReplyToReviewStoreInput,
  ReviewBookingRecord,
  ReviewStore,
} from '@/modules/reviews/app/reviews.ports'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'
import { createReviewInStore } from '@/modules/reviews/infra/create-review-in-store'
import {
  REVIEW_SELECT,
  mapReviewRow,
} from '@/modules/reviews/infra/map-review-row'

const MASTER_LIST_STATUSES = ['pending_review', 'published'] as const

const BOOKING_STATUS: Record<PrismaBookingStatus, BookingStatus> = {
  hold: 'hold',
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled_by_client: 'cancelled_by_client',
  cancelled_by_master: 'cancelled_by_master',
  no_show: 'no_show',
  expired: 'expired',
}

@Injectable()
export class ReviewRepository implements ReviewStore {
  constructor(private readonly tx: TransactionManager) {}

  async findMasterIdByUserId(userId: string): Promise<string | null> {
    const row = await this.tx.getClient().masterProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    return row?.id ?? null
  }

  async findPublicMasterIdBySlug(slug: string): Promise<string | null> {
    const row = await this.tx.getClient().masterProfile.findFirst({
      where: {
        slug,
        status: { in: ['pending_review', 'published'] },
      },
      select: { id: true },
    })

    return row?.id ?? null
  }

  async findBookingForReview(
    bookingId: string,
  ): Promise<ReviewBookingRecord | null> {
    const row = await this.tx.getClient().booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        masterId: true,
        clientUserId: true,
        serviceTitle: true,
        status: true,
        completedAt: true,
        reviews: { select: { id: true, authorRole: true } },
      },
    })

    if (!row) {
      return null
    }

    return {
      id: row.id,
      masterId: row.masterId,
      clientUserId: row.clientUserId,
      serviceTitle: row.serviceTitle,
      status: BOOKING_STATUS[row.status],
      completedAt: row.completedAt,
      hasClientReview: row.reviews.some((item) => item.authorRole === 'client'),
      hasMasterReview: row.reviews.some((item) => item.authorRole === 'master'),
    }
  }

  async findById(id: string): Promise<ReviewRecord | null> {
    const row = await this.tx.getClient().review.findUnique({
      where: { id },
      select: REVIEW_SELECT,
    })

    if (!row) {
      return null
    }

    return mapReviewRow(row)
  }

  async createReview(input: CreateReviewStoreInput): Promise<ReviewRecord> {
    try {
      return await createReviewInStore(this.tx.getClient(), input)
    } catch (error: unknown) {
      const isUniqueConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT

      if (isUniqueConflict) {
        throw DomainError.invalidState('Отзыв по этой записи уже оставлен')
      }

      throw error
    }
  }

  async replyToReview(
    input: ReplyToReviewStoreInput,
  ): Promise<ReviewRecord | null> {
    const db = this.tx.getClient()

    const updated = await db.review.updateMany({
      where: {
        id: input.reviewId,
        masterId: input.masterId,
        authorRole: 'client',
        status: 'published',
        masterReply: null,
      },
      data: {
        masterReply: input.text,
        repliedAt: input.now,
      },
    })

    if (updated.count === 0) {
      return null
    }

    const row = await db.review.findUnique({
      where: { id: input.reviewId },
      select: REVIEW_SELECT,
    })

    if (!row) {
      return null
    }

    return mapReviewRow(row)
  }

  async listPublishedByMasterId(masterId: string): Promise<ReviewRecord[]> {
    const rows = await this.tx.getClient().review.findMany({
      where: {
        masterId,
        authorRole: 'client',
        status: 'published',
        rating: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: REVIEW_SELECT,
    })

    return rows.map(mapReviewRow)
  }

  async listForMaster(masterId: string): Promise<ReviewRecord[]> {
    const rows = await this.tx.getClient().review.findMany({
      where: {
        masterId,
        authorRole: 'client',
        status: { in: [...MASTER_LIST_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: REVIEW_SELECT,
    })

    return rows.map(mapReviewRow)
  }

  async listReceivedByClientUserId(
    clientUserId: string,
  ): Promise<ReviewRecord[]> {
    const rows = await this.tx.getClient().review.findMany({
      where: {
        clientUserId,
        authorRole: 'master',
        status: { in: [...MASTER_LIST_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: REVIEW_SELECT,
    })

    return rows.map(mapReviewRow)
  }

  async findClientRating(clientUserId: string): Promise<{
    ratingAvg: number
    ratingCount: number
  }> {
    const row = await this.tx.getClient().clientProfile.findUnique({
      where: { userId: clientUserId },
      select: { ratingAvg: true, ratingCount: true },
    })

    return {
      ratingAvg: row ? Number(row.ratingAvg) : 0,
      ratingCount: row?.ratingCount ?? 0,
    }
  }
}