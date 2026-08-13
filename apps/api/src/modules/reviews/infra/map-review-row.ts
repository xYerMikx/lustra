import type { Prisma, ReviewStatus as PrismaReviewStatus } from '@lustra/db'
import type { ReviewStatus } from '@lustra/contracts'

import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const REVIEW_STATUS: Record<PrismaReviewStatus, ReviewStatus> = {
  pending_review: 'pending_review',
  published: 'published',
  rejected: 'rejected',
  hidden: 'hidden',
}

export const REVIEW_SELECT = {
  id: true,
  bookingId: true,
  masterId: true,
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
} as const

type ReviewRow = {
  id: string
  bookingId: string
  masterId: string
  rating: number
  text: string | null
  status: PrismaReviewStatus
  createdAt: Date
  masterReply: string | null
  repliedAt: Date | null
  client: {
    firstName: string
  }
}

export function mapReviewRow(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    bookingId: row.bookingId,
    masterId: row.masterId,
    rating: row.rating,
    text: row.text,
    status: REVIEW_STATUS[row.status],
    createdAt: row.createdAt,
    masterReply: row.masterReply,
    repliedAt: row.repliedAt,
    clientFirstName: row.client.firstName,
  }
}

export type TxClient = Prisma.TransactionClient
