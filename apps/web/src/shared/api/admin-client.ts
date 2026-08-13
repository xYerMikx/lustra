import type {
  AdminListMastersResponse,
  MasterProfileStatus,
  ModerateMasterAction,
  ModerateMasterResponse,
} from '@lustra/contracts'

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
