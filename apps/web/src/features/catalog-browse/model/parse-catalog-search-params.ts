import type { SearchMastersQuery } from '@lustra/contracts'
import { SearchMastersQuerySchema } from '@lustra/contracts'

type SearchParamValue = string | string[] | undefined

export type CatalogPageSearchParams = {
  district?: SearchParamValue
  priceMin?: SearchParamValue
  priceMax?: SearchParamValue
  ratingMin?: SearchParamValue
  locationType?: SearchParamValue
  sort?: SearchParamValue
}

function firstParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function parseCatalogSearchParams(
  params: CatalogPageSearchParams,
  category?: string,
): SearchMastersQuery {
  const parsed = SearchMastersQuerySchema.safeParse({
    category,
    district: firstParam(params.district),
    priceMin: firstParam(params.priceMin),
    priceMax: firstParam(params.priceMax),
    ratingMin: firstParam(params.ratingMin),
    locationType: firstParam(params.locationType),
    sort: firstParam(params.sort),
  })

  if (!parsed.success) {
    return category ? { category } : {}
  }

  return parsed.data
}

export function hasActiveCatalogFilters(query: SearchMastersQuery): boolean {
  if (query.district || query.locationType) {
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
