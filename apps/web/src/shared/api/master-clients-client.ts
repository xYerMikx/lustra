import type {
  MasterClientListResponse,
  MasterClientView,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function listMasterClients(
  query = '',
  sort: 'recent' | 'frequent' = 'recent',
) {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set('query', query.trim())
  }

  if (sort !== 'recent') {
    params.set('sort', sort)
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : ''

  return apiFetch<MasterClientListResponse>(`/master/clients${suffix}`)
}

export type { MasterClientView }
