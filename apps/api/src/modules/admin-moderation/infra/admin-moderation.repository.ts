import { Injectable } from '@nestjs/common'
import type { MasterStatus, ModerationStatus, Prisma, ReviewStatus } from '@lustra/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import { recalculateMasterRatingInStore } from '@/modules/reviews/infra/create-review-in-store'

export type AdminMasterRecord = {
  id: string
  slug: string
  displayName: string
  status: MasterStatus
  updatedAt: Date
  locations: Array<{
    isPrimary: boolean
    district: { name: string }
  }>
}

export type AdminPortfolioRecord = {
  id: string
  caption: string | null
  createdAt: Date
  master: {
    id: string
    slug: string
    displayName: string
  }
  media: {
    storageKey: string
    moderation: ModerationStatus
  }
}

export type AdminReviewRecord = {
  id: string
  rating: number
  text: string | null
  status: ReviewStatus
  createdAt: Date
  masterId: string
  master: {
    slug: string
    displayName: string
  }
  client: {
    firstName: string
  }
}

export type AuditLogInput = {
  currentUserId: string
  action: string
  entity: string
  entityId: string
  payload?: Prisma.InputJsonValue
  ip?: string
}

@Injectable()
export class AdminModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByStatus(status: MasterStatus, limit: number): Promise<AdminMasterRecord[]> {
    return this.prisma.masterProfile.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  findById(masterId: string): Promise<AdminMasterRecord | null> {
    return this.prisma.masterProfile.findUnique({
      where: { id: masterId },
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  async updateStatus(
    masterId: string,
    data: {
      status: MasterStatus
      publishedAt?: Date | null
    },
  ): Promise<AdminMasterRecord> {
    return this.prisma.masterProfile.update({
      where: { id: masterId },
      data: {
        status: data.status,
        ...(data.publishedAt !== undefined
          ? { publishedAt: data.publishedAt }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  writeAuditLog(input: AuditLogInput): Promise<unknown> {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.currentUserId,
        actorType: 'admin',
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload,
        ip: input.ip,
      },
    })
  }

  listPortfolioByModeration(
    status: ModerationStatus,
    limit: number,
  ): Promise<AdminPortfolioRecord[]> {
    return this.prisma.portfolioItem.findMany({
      where: {
        deletedAt: null,
        media: { deletedAt: null, moderation: status },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: PORTFOLIO_SELECT,
    })
  }

  findPortfolioById(itemId: string): Promise<AdminPortfolioRecord | null> {
    return this.prisma.portfolioItem.findFirst({
      where: { id: itemId, deletedAt: null },
      select: PORTFOLIO_SELECT,
    })
  }

  async updatePortfolioModeration(
    itemId: string,
    moderation: ModerationStatus,
  ): Promise<AdminPortfolioRecord> {
    const current = await this.prisma.portfolioItem.findFirstOrThrow({
      where: { id: itemId, deletedAt: null },
      select: { mediaId: true },
    })

    await this.prisma.mediaAsset.update({
      where: { id: current.mediaId },
      data: { moderation },
    })

    return this.prisma.portfolioItem.findFirstOrThrow({
      where: { id: itemId },
      select: PORTFOLIO_SELECT,
    })
  }

  listReviewsByStatus(
    status: ReviewStatus,
    limit: number,
  ): Promise<AdminReviewRecord[]> {
    return this.prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: REVIEW_SELECT,
    })
  }

  findReviewById(reviewId: string): Promise<AdminReviewRecord | null> {
    return this.prisma.review.findUnique({
      where: { id: reviewId },
      select: REVIEW_SELECT,
    })
  }

  async updateReviewStatus(
    reviewId: string,
    status: ReviewStatus,
    now: Date,
  ): Promise<AdminReviewRecord> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: { status },
        select: REVIEW_SELECT,
      })

      await recalculateMasterRatingInStore(tx, updated.masterId, now)

      return updated
    })
  }
}

const PORTFOLIO_SELECT = {
  id: true,
  caption: true,
  createdAt: true,
  master: {
    select: {
      id: true,
      slug: true,
      displayName: true,
    },
  },
  media: {
    select: {
      storageKey: true,
      moderation: true,
    },
  },
} as const satisfies Prisma.PortfolioItemSelect

const REVIEW_SELECT = {
  id: true,
  rating: true,
  text: true,
  status: true,
  createdAt: true,
  masterId: true,
  master: {
    select: {
      slug: true,
      displayName: true,
    },
  },
  client: {
    select: {
      firstName: true,
    },
  },
} as const satisfies Prisma.ReviewSelect
