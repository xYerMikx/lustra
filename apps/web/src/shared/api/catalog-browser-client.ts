import type {
  PublicMasterView,
  SearchMastersQuery,
  SearchMastersResponse,
  ServiceCategoryListResponse,
  ServiceTemplateListResponse,
} from '@lustra/contracts'

import { catalogApiQuery } from '@/features/catalog-browse/model/href-for-category'
import { apiFetch } from '@/shared/api/http'

export function fetchCatalogCategories() {
  return apiFetch<ServiceCategoryListResponse>('/catalog/categories')
}

export function fetchCatalogServiceTemplates(categorySlug?: string) {
  const params = new URLSearchParams()

  if (categorySlug) {
    params.set('categorySlug', categorySlug)
  }

  const suffix = params.toString()

  return apiFetch<ServiceTemplateListResponse>(
    `/catalog/service-templates${suffix ? `?${suffix}` : ''}`,
  )
}

export function fetchCatalogMasters(query: SearchMastersQuery = {}) {
  return apiFetch<SearchMastersResponse>(
    `/catalog/masters${catalogApiQuery(query)}`,
  )
}

export function fetchPublicMasterBySlug(slug: string) {
  return apiFetch<PublicMasterView>(
    `/catalog/masters/${encodeURIComponent(slug)}`,
  )
}
