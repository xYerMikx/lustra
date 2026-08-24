import type { ClientRecommendationsResponse } from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function fetchClientRecommendations() {
  return apiFetch<ClientRecommendationsResponse>('/client/recommendations')
}
