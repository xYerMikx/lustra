import type {
  MasterClientListResponse,
  MasterClientView,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function listMasterClients(query = '') {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set('query', query.trim())
  }

  const suffix = params.size > 0 ? `?${params.toString()}` : ''

  return apiFetch<MasterClientListResponse>(`/master/clients${suffix}`)
}

export type { MasterClientView }
