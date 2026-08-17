import type {
  CreateReviewInput,
  CreateReviewResponse,
  MasterReviewListResponse,
  PublicReviewListResponse,
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

export function listMasterReviews() {
  return apiFetch<MasterReviewListResponse>('/master/reviews')
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
