import type {
  CreateReviewInput,
  CreateReviewResponse,
  CreateMasterClientReviewInput,
  CreateMasterClientReviewResponse,
  MasterReviewListResponse,
  PublicReviewListResponse,
  ReceivedClientReviewListResponse,
  ReplyToReviewInput,
  ReplyToReviewResponse,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function createReview(input: CreateReviewInput) {
  return apiFetch<CreateReviewResponse>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function createMasterClientReview(input: CreateMasterClientReviewInput) {
  return apiFetch<CreateMasterClientReviewResponse>('/master/client-reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listMasterReviews() {
  return apiFetch<MasterReviewListResponse>('/master/reviews')
}

export function listClientReviews() {
  return apiFetch<ReceivedClientReviewListResponse>('/client/reviews')
}

export function replyToReview(reviewId: string, input: ReplyToReviewInput) {
  return apiFetch<ReplyToReviewResponse>(
    `/master/reviews/${encodeURIComponent(reviewId)}/reply`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export function listPublicReviews(slug: string) {
  return apiFetch<PublicReviewListResponse>(
    `/catalog/masters/${encodeURIComponent(slug)}/reviews`,
  )
}
