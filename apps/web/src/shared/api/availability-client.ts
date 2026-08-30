import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from '@lumira/contracts'

import { apiFetch } from '@/shared/api/http'

export function fetchMasterAvailability(
  masterId: string,
  query: AvailabilityQuery,
) {
  const params = new URLSearchParams({
    serviceId: query.serviceId,
    from: query.from,
    to: query.to,
  })

  return apiFetch<AvailabilityResponse>(
    `/catalog/masters/${masterId}/availability?${params.toString()}`,
    { method: 'GET' },
  )
}
