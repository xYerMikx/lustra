import { z } from 'zod'

export const SearchMastersQuerySchema = z
  .object({
    category: z.string().trim().min(1).max(64).optional(),
    district: z.string().trim().min(1).max(64).optional(),
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
