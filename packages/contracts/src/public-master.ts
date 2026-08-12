import { z } from 'zod'

import { MasterProfileStatusSchema } from './auth'
import {
  LocationTypeSchema,
  MasterLocationViewSchema,
} from './master-profile'
import { PriceTypeSchema } from './master-services'

/** Public service card — no internal buffer / sort noise beyond what's needed to book. */
export const PublicServiceViewSchema = z.object({
  id: z.string().uuid(),
  categoryName: z.string(),
  categorySlug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  durationMin: z.number().int().positive(),
  price: z.number(),
  priceMax: z.number().nullable(),
  priceType: PriceTypeSchema,
  currency: z.string(),
})
export type PublicServiceView = z.infer<typeof PublicServiceViewSchema>

export const PublicMasterContactViewSchema = z.object({
  publicPhone: z.string().nullable(),
  instagram: z.string().nullable(),
  telegramUsername: z.string().nullable(),
})
export type PublicMasterContactView = z.infer<typeof PublicMasterContactViewSchema>

/**
 * Public master page DTO.
 * Intentionally omits: addressExact, lat/lng, boostPriority, trustScore,
 * masterNote, verification docs, internal stats (noShowRate, profileViews…).
 */
export const PublicMasterViewSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  status: z.enum(['pending_review', 'published']),
  experienceSince: z.number().int().nullable(),
  languages: z.array(z.string()).nullable(),
  primaryLocation: MasterLocationViewSchema.nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number().int().nonnegative(),
  contact: PublicMasterContactViewSchema.nullable(),
  services: z.array(PublicServiceViewSchema),
})
export type PublicMasterView = z.infer<typeof PublicMasterViewSchema>

export const PUBLIC_MASTER_STATUSES = ['pending_review', 'published'] as const
export type PublicMasterStatus = (typeof PUBLIC_MASTER_STATUSES)[number]

export function isPublicMasterStatus(
  status: z.infer<typeof MasterProfileStatusSchema>,
): status is PublicMasterStatus {
  return status === 'pending_review' || status === 'published'
}

export const PublicLocationTypeSchema = LocationTypeSchema
