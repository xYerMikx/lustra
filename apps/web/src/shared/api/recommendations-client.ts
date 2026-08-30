import type { ClientRecommendationsResponse } from '@lumira/contracts'

import { apiFetch } from '@/shared/api/http'

export function fetchClientRecommendations() {
  return apiFetch<ClientRecommendationsResponse>('/client/recommendations')
}
