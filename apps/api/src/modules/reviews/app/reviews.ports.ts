import type { BookingStatus, ReviewAuthorRole, ReviewStatus } from '@lustra/contracts'

import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

export type ReviewBookingRecord = {
  id: string
  masterId: string
  clientUserId: string | null
  serviceTitle: string
  status: BookingStatus
  completedAt: Date | null
  hasClientReview: boolean
  hasMasterReview: boolean
}

export type CreateReviewStoreInput = {
  bookingId: string
  masterId: string
  clientUserId: string
  currentUserId: string
  authorRole: ReviewAuthorRole
  serviceTitle: string
  rating: number | null
  text: string | null
  status: Extract<ReviewStatus, 'published' | 'pending_review'>
  now: Date
}

export type ReplyToReviewStoreInput = {
  reviewId: string
  masterId: string
  text: string
  now: Date
}

export type ReviewStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  findPublicMasterIdBySlug(slug: string): Promise<string | null>
  findBookingForReview(bookingId: string): Promise<ReviewBookingRecord | null>
  findById(id: string): Promise<ReviewRecord | null>
  createReview(input: CreateReviewStoreInput): Promise<ReviewRecord>
  replyToReview(input: ReplyToReviewStoreInput): Promise<ReviewRecord | null>
  listPublishedByMasterId(masterId: string): Promise<ReviewRecord[]>
  listForMaster(masterId: string): Promise<ReviewRecord[]>
  listReceivedByClientUserId(clientUserId: string): Promise<ReviewRecord[]>
  findClientRating(clientUserId: string): Promise<{
    ratingAvg: number
    ratingCount: number
  }>
}