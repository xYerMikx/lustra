import type { CatalogMasterCard } from '@lumira/contracts'

export type CatalogMasterRecord = {
  id: string
  slug: string
  displayName: string
  headline: string | null
  boostPriority: number
  locations: Array<{
    isPrimary: boolean
    district: {
      name: string
      slug: string
    }
  }>
  services: Array<{
    category: {
      name: string
      slug: string
    }
  }>
  stats: {
    ratingAvg: { toString(): string } | number | string
    ratingCount: number
    priceMin: { toString(): string } | number | string | null
  } | null
}

export function toCatalogMasterCard(
  record: CatalogMasterRecord,
): CatalogMasterCard {
  const primary =
    record.locations.find((location) => location.isPrimary) ??
    record.locations[0] ??
    null

  const specialtyNames = [
    ...new Set(record.services.map((service) => service.category.name)),
  ]

  return {
    id: record.id,
    slug: record.slug,
    displayName: record.displayName,
    headline: record.headline,
    districtName: primary?.district.name ?? null,
    districtSlug: primary?.district.slug ?? null,
    ratingAvg: toNumber(record.stats?.ratingAvg ?? 0),
    ratingCount: record.stats?.ratingCount ?? 0,
    priceFrom:
      record.stats?.priceMin == null ? null : toNumber(record.stats.priceMin),
    specialty:
      specialtyNames.length > 0 ? specialtyNames.join(' · ') : null,
  }
}

function toNumber(value: { toString(): string } | number | string): number {
  if (typeof value === 'number') {
    return value
  }

  return Number(value)
}
