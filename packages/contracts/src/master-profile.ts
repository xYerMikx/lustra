import { z } from 'zod'

import { MasterProfileStatusSchema } from './auth'
import { ByPhoneSchema } from './phone'
import {
  InstagramHandleSchema,
  TelegramHandleSchema,
  WebsiteUrlSchema,
} from './social-handle'

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

export const MasterContactViewSchema = z.object({
  publicPhone: z.string().nullable(),
  instagram: z.string().nullable(),
  telegramUsername: z.string().nullable(),
  website: z.string().nullable(),
})
export type MasterContactView = z.infer<typeof MasterContactViewSchema>

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
  contact: MasterContactViewSchema.nullable(),
})
export type MasterProfileView = z.infer<typeof MasterProfileViewSchema>

/** Public URL segment for `/m/[slug]` — latin, digits, hyphens. */
export const MasterSlugSchema = z
  .string()
  .trim()
  .min(3, 'Минимум 3 символа')
  .max(48, 'Максимум 48 символов')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Только латиница, цифры и дефис (без пробелов)',
  )
export type MasterSlug = z.infer<typeof MasterSlugSchema>

export const CheckSlugAvailabilityQuerySchema = z
  .object({
    slug: MasterSlugSchema,
  })
  .strict()
export type CheckSlugAvailabilityQuery = z.infer<
  typeof CheckSlugAvailabilityQuerySchema
>

export const CheckSlugAvailabilityResponseSchema = z.object({
  slug: MasterSlugSchema,
  available: z.boolean(),
})
export type CheckSlugAvailabilityResponse = z.infer<
  typeof CheckSlugAvailabilityResponseSchema
>

const OptionalPublicPhoneSchema = z.union([
  z.literal('').transform(() => null),
  z.null(),
  ByPhoneSchema,
])

const OptionalInstagramSchema = z.union([
  z.literal('').transform(() => null),
  z.null(),
  InstagramHandleSchema,
])

const OptionalTelegramSchema = z.union([
  z.literal('').transform(() => null),
  z.null(),
  TelegramHandleSchema,
])

const OptionalWebsiteSchema = z.union([
  z.literal('').transform(() => null),
  z.null(),
  WebsiteUrlSchema,
])

export const PatchMasterContactInputSchema = z
  .object({
    publicPhone: OptionalPublicPhoneSchema,
    instagram: OptionalInstagramSchema,
    telegramUsername: OptionalTelegramSchema,
    website: OptionalWebsiteSchema,
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Укажите хотя бы одно поле для обновления',
  })
export type PatchMasterContactInput = z.infer<typeof PatchMasterContactInputSchema>

export const PatchMasterProfileInputSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80),
    slug: MasterSlugSchema,
    headline: z.string().trim().max(120).nullable(),
    bio: z.string().trim().max(1000).nullable(),
    districtId: z.string().uuid(),
    locationType: LocationTypeSchema,
    addressHint: z.string().trim().max(200).nullable(),
    publicPhone: OptionalPublicPhoneSchema,
    instagram: OptionalInstagramSchema,
    telegramUsername: OptionalTelegramSchema,
    website: OptionalWebsiteSchema,
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Укажите хотя бы одно поле для обновления',
  })
export type PatchMasterProfileInput = z.infer<typeof PatchMasterProfileInputSchema>

export const StepBasicsInputSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80),
    districtId: z.string().uuid(),
    locationType: LocationTypeSchema,
    headline: z.string().trim().max(120),
  })
  .strict()
export type StepBasicsInput = z.infer<typeof StepBasicsInputSchema>
