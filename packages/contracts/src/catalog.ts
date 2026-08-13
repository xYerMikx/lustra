import { z } from 'zod'

import { LocationTypeSchema } from './master-profile'
import { YmdDateSchema } from './master-schedule'

export const CATALOG_SORTS = [
  'recommended',
  'price_asc',
  'price_desc',
  'rating',
] as const
export const CatalogSortSchema = z.enum(CATALOG_SORTS)
export type CatalogSort = z.infer<typeof CatalogSortSchema>

function blankToUndefined(value: unknown): unknown {
  if (value === '' || value === null) {
    return undefined
  }

  return value
}

const OptionalQueryText = z.preprocess(
  blankToUndefined,
  z.string().trim().min(1).max(64).optional(),
)

const OptionalQueryPrice = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative().max(10_000).optional(),
)

const OptionalQueryRating = z.preprocess(
  blankToUndefined,
  z.coerce.number().min(0).max(5).optional(),
)

const OptionalLocationType = z.preprocess(
  blankToUndefined,
  LocationTypeSchema.optional(),
)

const OptionalCatalogSort = z.preprocess(
  blankToUndefined,
  CatalogSortSchema.optional(),
)

function toDistrictList(value: unknown): string[] | undefined {
  if (value === '' || value == null) {
    return undefined
  }

  const raw = Array.isArray(value) ? value : [value]
  const slugs = raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)
    .slice(0, 3)

  if (slugs.length === 0) {
    return undefined
  }

  return slugs
}

const OptionalDistricts = z.preprocess(
  toDistrictList,
  z.array(z.string().min(1).max(64)).max(3).optional(),
)

const OptionalAvailableOn = z.preprocess(
  blankToUndefined,
  YmdDateSchema.optional(),
)

const OptionalService = z.preprocess(
  blankToUndefined,
  z.string().trim().min(1).max(120).optional(),
)

export const SearchMastersQuerySchema = z
  .object({
    category: OptionalQueryText,
    service: OptionalService,
    district: OptionalDistricts,
    priceMin: OptionalQueryPrice,
    priceMax: OptionalQueryPrice,
    ratingMin: OptionalQueryRating,
    locationType: OptionalLocationType,
    availableOn: OptionalAvailableOn,
    sort: OptionalCatalogSort,
  })
  .strict()
  .default({})
export type SearchMastersQuery = z.infer<typeof SearchMastersQuerySchema>

export const CatalogMasterCardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  headline: z.string().nullable(),
  districtName: z.string().nullable(),
  districtSlug: z.string().nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number().int().nonnegative(),
  priceFrom: z.number().nullable(),
  specialty: z.string().nullable(),
})
export type CatalogMasterCard = z.infer<typeof CatalogMasterCardSchema>

export const SearchMastersResponseSchema = z.object({
  items: z.array(CatalogMasterCardSchema),
})
export type SearchMastersResponse = z.infer<typeof SearchMastersResponseSchema>
