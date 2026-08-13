import type {
  SearchMastersQuery,
  SearchMastersResponse,
  ServiceCategoryListResponse,
  DistrictListResponse,
  PublicMasterView,
  PublicReviewListResponse,
  AvailabilityQuery,
  AvailabilityResponse,
} from '@lustra/contracts'

import { catalogApiQuery } from '@/features/catalog-browse/model/href-for-category'

import {
  ApiError,
  readJsonBody,
  toApiError,
} from '@/shared/api/http'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

const NOT_FOUND_ERROR = {
  code: 'NOT_FOUND',
  message: 'Не найдено',
} as const

async function serverFetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 },
  })

  if (response.status === 404) {
    throw new ApiError(404, NOT_FOUND_ERROR)
  }

  const payload = await readJsonBody(response)

  if (!response.ok) {
    throw toApiError(response.status, payload)
  }

  return payload as T
}

export function searchMasters(query: SearchMastersQuery = {}) {
  return serverFetchJson<SearchMastersResponse>(
    `/catalog/masters${catalogApiQuery(query)}`,
  )
}

export function listCatalogDistricts() {
  return serverFetchJson<DistrictListResponse>('/catalog/districts')
}

export function listCatalogCategories() {
  return serverFetchJson<ServiceCategoryListResponse>('/catalog/categories')
}

export function getPublicMasterBySlug(slug: string) {
  return serverFetchJson<PublicMasterView>(
    `/catalog/masters/${encodeURIComponent(slug)}`,
  )
}

export function getPublicMasterReviews(slug: string) {
  return serverFetchJson<PublicReviewListResponse>(
    `/catalog/masters/${encodeURIComponent(slug)}/reviews`,
  )
}

export function getMasterAvailability(
  masterId: string,
  query: AvailabilityQuery,
) {
  const params = new URLSearchParams({
    serviceId: query.serviceId,
    from: query.from,
    to: query.to,
  })

  return serverFetchJson<AvailabilityResponse>(
    `/catalog/masters/${masterId}/availability?${params.toString()}`,
  )
}
