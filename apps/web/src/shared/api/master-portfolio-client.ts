import type {
  CreatePortfolioQuery,
  PatchPortfolioItemInput,
  PortfolioItemView,
  PortfolioListResponse,
} from '@lumira/contracts'

import { apiFetch } from '@/shared/api/http'

export function listMasterPortfolio() {
  return apiFetch<PortfolioListResponse>('/master/portfolio', { method: 'GET' })
}

export function uploadMasterPortfolio(
  file: Blob,
  query: CreatePortfolioQuery = {},
) {
  const params = new URLSearchParams()

  if (query.caption) {
    params.set('caption', query.caption)
  }

  if (query.serviceId) {
    params.set('serviceId', query.serviceId)
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : ''

  return apiFetch<PortfolioItemView>(`/master/portfolio${suffix}`, {
    method: 'POST',
    body: file,
  })
}

export function patchMasterPortfolio(
  id: string,
  input: PatchPortfolioItemInput,
) {
  return apiFetch<PortfolioItemView>(`/master/portfolio/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteMasterPortfolio(id: string) {
  return apiFetch(`/master/portfolio/${id}`, { method: 'DELETE' })
}
