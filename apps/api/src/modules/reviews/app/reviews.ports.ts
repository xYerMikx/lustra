import type { BookingStatus, ReviewStatus } from '@lustra/contracts'

import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

export type ReviewBookingRecord = {
  id: string
  masterId: string
  clientUserId: string | null
  status: BookingStatus
  completedAt: Date | null
  hasReview: boolean
}

export type CreateReviewStoreInput = {
  bookingId: string
  masterId: string
  clientUserId: string
  currentUserId: string
  rating: number
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
}
