import { z } from 'zod'

import { MasterProfileStatusSchema } from './auth'

export const LocationTypeSchema = z.enum(['salon', 'home_studio', 'client_home'])
export type LocationType = z.infer<typeof LocationTypeSchema>

export const DistrictViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  city: z.string(),
})
export type DistrictView = z.infer<typeof DistrictViewSchema>

export const DistrictListResponseSchema = z.object({
  districts: z.array(DistrictViewSchema),
})
export type DistrictListResponse = z.infer<typeof DistrictListResponseSchema>

/** Primary work location — no `addressExact` (private until confirmed booking). */
export const MasterLocationViewSchema = z.object({
  id: z.string().uuid(),
  districtId: z.string().uuid(),
  districtName: z.string(),
  districtSlug: z.string(),
  type: LocationTypeSchema,
  addressHint: z.string().nullable(),
  isPrimary: z.boolean(),
})
export type MasterLocationView = z.infer<typeof MasterLocationViewSchema>

export const MasterProfileViewSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  status: MasterProfileStatusSchema,
  experienceSince: z.number().int().nullable(),
  languages: z.array(z.string()).nullable(),
  primaryLocation: MasterLocationViewSchema.nullable(),
})
export type MasterProfileView = z.infer<typeof MasterProfileViewSchema>

export const PatchMasterProfileInputSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80),
    headline: z.string().trim().max(120).nullable(),
    bio: z.string().trim().max(1000).nullable(),
    districtId: z.string().uuid(),
    locationType: LocationTypeSchema,
    addressHint: z.string().trim().max(200).nullable(),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Укажите хотя бы одно поле для обновления',
  })
export type PatchMasterProfileInput = z.infer<typeof PatchMasterProfileInputSchema>
