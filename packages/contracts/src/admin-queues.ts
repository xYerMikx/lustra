import { z } from 'zod'

import { MediaModerationStatusSchema } from './master-portfolio'
import { ReviewStatusSchema } from './review'

export const ModeratePortfolioActionSchema = z.enum(['approve', 'reject'])
export type ModeratePortfolioAction = z.infer<
  typeof ModeratePortfolioActionSchema
>

export const AdminListPortfolioQuerySchema = z
  .object({
    status: MediaModerationStatusSchema.default('pending'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()
export type AdminListPortfolioQuery = z.infer<
  typeof AdminListPortfolioQuerySchema
>

export const AdminPortfolioCardSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  caption: z.string().nullable(),
  moderation: MediaModerationStatusSchema,
  masterId: z.string().uuid(),
  masterSlug: z.string(),
  masterDisplayName: z.string(),
  createdAt: z.string().datetime(),
})
export type AdminPortfolioCard = z.infer<typeof AdminPortfolioCardSchema>

export const AdminListPortfolioResponseSchema = z.object({
  items: z.array(AdminPortfolioCardSchema),
})
export type AdminListPortfolioResponse = z.infer<
  typeof AdminListPortfolioResponseSchema
>

export const ModeratePortfolioInputSchema = z
  .object({
    action: ModeratePortfolioActionSchema,
    comment: z.string().trim().max(500).optional(),
  })
  .strict()
export type ModeratePortfolioInput = z.infer<
  typeof ModeratePortfolioInputSchema
>

export const ModeratePortfolioResponseSchema = z.object({
  item: AdminPortfolioCardSchema,
})
export type ModeratePortfolioResponse = z.infer<
  typeof ModeratePortfolioResponseSchema
>

export const ModerateReviewActionSchema = z.enum([
  'approve',
  'reject',
  'hide',
])
export type ModerateReviewAction = z.infer<typeof ModerateReviewActionSchema>

export const AdminListReviewsQuerySchema = z
  .object({
    status: ReviewStatusSchema.default('pending_review'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()
export type AdminListReviewsQuery = z.infer<typeof AdminListReviewsQuerySchema>

export const AdminReviewCardSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  status: ReviewStatusSchema,
  masterId: z.string().uuid(),
  masterSlug: z.string(),
  masterDisplayName: z.string(),
  clientFirstName: z.string(),
  createdAt: z.string().datetime(),
})
export type AdminReviewCard = z.infer<typeof AdminReviewCardSchema>

export const AdminListReviewsResponseSchema = z.object({
  items: z.array(AdminReviewCardSchema),
})
export type AdminListReviewsResponse = z.infer<
  typeof AdminListReviewsResponseSchema
>

export const ModerateReviewInputSchema = z
  .object({
    action: ModerateReviewActionSchema,
    comment: z.string().trim().max(500).optional(),
  })
  .strict()
export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>

export const ModerateReviewResponseSchema = z.object({
  review: AdminReviewCardSchema,
})
export type ModerateReviewResponse = z.infer<
  typeof ModerateReviewResponseSchema
>
