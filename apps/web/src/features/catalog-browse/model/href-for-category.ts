import type { SearchMastersQuery } from '@lustra/contracts'

export function catalogSearchParams(query: SearchMastersQuery): URLSearchParams {
  const params = new URLSearchParams()

  for (const slug of query.district ?? []) {
    params.append('district', slug)
  }

  if (query.service) {
    params.set('service', query.service)
  }

  if (query.priceMin != null) {
    params.set('priceMin', String(query.priceMin))
  }

  if (query.priceMax != null) {
    params.set('priceMax', String(query.priceMax))
  }

  if (query.ratingMin != null) {
    params.set('ratingMin', String(query.ratingMin))
  }

  if (query.locationType) {
    params.set('locationType', query.locationType)
  }

  if (query.availableOn) {
    params.set('availableOn', query.availableOn)
  }

  if (query.sort && query.sort !== 'recommended') {
    params.set('sort', query.sort)
  }

  return params
}

export function catalogApiQuery(query: SearchMastersQuery): string {
  const params = catalogSearchParams(query)

  if (query.category) {
    params.set('category', query.category)
  }

  const suffix = params.toString()

  return suffix ? `?${suffix}` : ''
}

export function catalogHref(query: SearchMastersQuery): string {
  const base = query.category ? `/catalog/${query.category}` : '/catalog'
  const suffix = catalogSearchParams(query).toString()

  return suffix ? `${base}?${suffix}` : base
}

export function hrefForCategory(
  slug: string | undefined,
  query: SearchMastersQuery = {},
): string {
  return catalogHref({
    ...query,
    category: slug,
  })
}
