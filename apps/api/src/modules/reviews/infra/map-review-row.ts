import type {
  Prisma,
  ReviewAuthorRole as PrismaReviewAuthorRole,
  ReviewStatus as PrismaReviewStatus,
} from '@lustra/db'
import type { ReviewAuthorRole, ReviewStatus } from '@lustra/contracts'

import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const REVIEW_STATUS: Record<PrismaReviewStatus, ReviewStatus> = {
  pending_review: 'pending_review',
  published: 'published',
  rejected: 'rejected',
  hidden: 'hidden',
}

const AUTHOR_ROLE: Record<PrismaReviewAuthorRole, ReviewAuthorRole> = {
  client: 'client',
  master: 'master',
}

export const REVIEW_SELECT = {
  id: true,
  bookingId: true,
  masterId: true,
  authorRole: true,
  serviceTitle: true,
  rating: true,
  text: true,
  status: true,
  createdAt: true,
  masterReply: true,
  repliedAt: true,
  client: {
    select: {
      firstName: true,
    },
  },
  master: {
    select: {
      displayName: true,
    },
  },
} as const

type ReviewRow = {
  id: string
  bookingId: string
  masterId: string
  authorRole: PrismaReviewAuthorRole
  serviceTitle: string
  rating: number | null
  text: string | null
  status: PrismaReviewStatus
  createdAt: Date
  masterReply: string | null
  repliedAt: Date | null
  client: {
    firstName: string
  }
  master: {
    displayName: string
  }
}

export function mapReviewRow(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    bookingId: row.bookingId,
    masterId: row.masterId,
    authorRole: AUTHOR_ROLE[row.authorRole],
    serviceTitle: row.serviceTitle,
    rating: row.rating,
    text: row.text,
    status: REVIEW_STATUS[row.status],
    createdAt: row.createdAt,
    masterReply: row.masterReply,
    repliedAt: row.repliedAt,
    clientFirstName: row.client.firstName,
    masterDisplayName: row.master.displayName,
  }
}

export type TxClient = Prisma.TransactionClient