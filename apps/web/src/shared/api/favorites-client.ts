import type {
  FavoriteListResponse,
  FavoriteStatusResponse,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function listFavorites() {
  return apiFetch<FavoriteListResponse>('/favorites')
}

export function getFavoriteStatus(masterId: string) {
  return apiFetch<FavoriteStatusResponse>(
    `/favorites/${encodeURIComponent(masterId)}`,
  )
}

export function addFavorite(masterId: string) {
  return apiFetch<FavoriteStatusResponse>(
    `/favorites/${encodeURIComponent(masterId)}`,
    { method: 'POST' },
  )
}

export function removeFavorite(masterId: string) {
  return apiFetch<FavoriteStatusResponse>(
    `/favorites/${encodeURIComponent(masterId)}`,
    { method: 'DELETE' },
  )
}
