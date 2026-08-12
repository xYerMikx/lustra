import type {
  CheckSlugAvailabilityResponse,
  DistrictListResponse,
  MasterProfileView,
  PatchMasterProfileInput,
} from '@lustra/contracts'

import { apiFetch } from './http'

export function getMasterProfile() {
  return apiFetch<MasterProfileView>('/master/profile', { method: 'GET' })
}

export function patchMasterProfile(input: PatchMasterProfileInput) {
  return apiFetch<MasterProfileView>('/master/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function checkSlugAvailability(slug: string) {
  const params = new URLSearchParams({ slug })

  return apiFetch<CheckSlugAvailabilityResponse>(
    `/master/profile/slug-availability?${params.toString()}`,
    { method: 'GET' },
  )
}

export function listDistricts() {
  return apiFetch<DistrictListResponse>('/catalog/districts', { method: 'GET' })
}
