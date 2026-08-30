import type {
  AdminListPortfolioResponse,
  AdminListReviewsResponse,
  AdminListMastersResponse,
  MasterProfileStatus,
  MediaModerationStatus,
  ModerateMasterAction,
  ModerateMasterResponse,
  ModeratePortfolioAction,
  ModeratePortfolioResponse,
  ModerateReviewAction,
  ModerateReviewResponse,
  ReviewStatus,
} from '@lumira/contracts'

import { apiFetch } from '@/shared/api/http'

export function listAdminMasters(status: MasterProfileStatus = 'pending_review') {
  const params = new URLSearchParams({ status })

  return apiFetch<AdminListMastersResponse>(
    `/admin/masters?${params.toString()}`,
    { method: 'GET' },
  )
}

export function moderateMaster(
  masterId: string,
  action: ModerateMasterAction,
  comment?: string,
) {
  return apiFetch<ModerateMasterResponse>(
    `/admin/masters/${masterId}/moderate`,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(comment ? { comment } : {}),
      }),
    },
  )
}

export function listAdminPortfolio(
  status: MediaModerationStatus = 'pending',
) {
  const params = new URLSearchParams({ status })

  return apiFetch<AdminListPortfolioResponse>(
    `/admin/portfolio?${params.toString()}`,
    { method: 'GET' },
  )
}

export function moderatePortfolio(
  itemId: string,
  action: ModeratePortfolioAction,
  comment?: string,
) {
  return apiFetch<ModeratePortfolioResponse>(
    `/admin/portfolio/${itemId}/moderate`,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(comment ? { comment } : {}),
      }),
    },
  )
}

export function listAdminReviews(status: ReviewStatus = 'pending_review') {
  const params = new URLSearchParams({ status })

  return apiFetch<AdminListReviewsResponse>(
    `/admin/reviews?${params.toString()}`,
    { method: 'GET' },
  )
}

export function moderateReview(
  reviewId: string,
  action: ModerateReviewAction,
  comment?: string,
) {
  return apiFetch<ModerateReviewResponse>(
    `/admin/reviews/${reviewId}/moderate`,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(comment ? { comment } : {}),
      }),
    },
  )
}
