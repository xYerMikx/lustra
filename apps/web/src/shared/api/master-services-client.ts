import type {
  CreateServiceInput,
  ServiceCategoryListResponse,
  ServiceListResponse,
  ServiceTemplateListResponse,
  ServiceView,
  UpdateServiceInput,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function listMasterServices() {
  return apiFetch<ServiceListResponse>('/master/services', { method: 'GET' })
}

export function createMasterService(input: CreateServiceInput) {
  return apiFetch<ServiceView>('/master/services', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateMasterService(id: string, input: UpdateServiceInput) {
  return apiFetch<ServiceView>(`/master/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function listCategories() {
  return apiFetch<ServiceCategoryListResponse>('/catalog/categories', {
    method: 'GET',
  })
}

export function listServiceTemplates(categorySlug?: string) {
  const query = categorySlug
    ? `?categorySlug=${encodeURIComponent(categorySlug)}`
    : ''

  return apiFetch<ServiceTemplateListResponse>(
    `/catalog/service-templates${query}`,
    { method: 'GET' },
  )
}
