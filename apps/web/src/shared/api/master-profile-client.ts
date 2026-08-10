import type {
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

export function listDistricts() {
  return apiFetch<DistrictListResponse>('/catalog/districts', { method: 'GET' })
}
