import type { SearchMastersQuery } from '@lustra/contracts'
import { SearchMastersQuerySchema } from '@lustra/contracts'

type SearchParamValue = string | string[] | undefined

export type CatalogPageSearchParams = {
  district?: SearchParamValue
  service?: SearchParamValue
  priceMin?: SearchParamValue
  priceMax?: SearchParamValue
  ratingMin?: SearchParamValue
  locationType?: SearchParamValue
  availableOn?: SearchParamValue
  sort?: SearchParamValue
}

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

function allParams(value: SearchParamValue): string[] | undefined {
  if (value == null) {
    return undefined
  }

  const list = Array.isArray(value) ? value : [value]
  const cleaned = list.map((item) => item.trim()).filter((item) => item.length > 0)

  if (cleaned.length === 0) {
    return undefined
  }

  return cleaned
}

export function parseCatalogSearchParams(
  params: CatalogPageSearchParams,
  category?: string,
): SearchMastersQuery {
  const parsed = SearchMastersQuerySchema.safeParse({
    category,
    service: firstParam(params.service),
    district: allParams(params.district),
    priceMin: firstParam(params.priceMin),
    priceMax: firstParam(params.priceMax),
    ratingMin: firstParam(params.ratingMin),
    locationType: firstParam(params.locationType),
    availableOn: firstParam(params.availableOn),
    sort: firstParam(params.sort),
  })

  if (!parsed.success) {
    return category ? { category } : {}
  }

  return parsed.data
}

export function hasActiveCatalogFilters(query: SearchMastersQuery): boolean {
  if (query.district?.length || query.locationType) {
    return true
  }

  if (query.service || query.availableOn) {
    return true
  }

  if (query.priceMin != null || query.priceMax != null) {
    return true
  }

  if (query.ratingMin != null) {
    return true
  }

  return Boolean(query.sort && query.sort !== 'recommended')
}
