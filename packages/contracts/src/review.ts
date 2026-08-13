import { z } from 'zod'

export const REVIEW_WINDOW_DAYS = 14
export const REVIEW_TEXT_MAX = 800
export const REVIEW_REPLY_MAX = 500

export const ReviewStatusSchema = z.enum([
  'pending_review',
  'published',
  'rejected',
  'hidden',
])
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>

export const CreateReviewInputSchema = z
  .object({
    bookingId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().max(REVIEW_TEXT_MAX).optional(),
  })
  .strict()
export type CreateReviewInput = z.infer<typeof CreateReviewInputSchema>

export const ReplyToReviewInputSchema = z
  .object({
    text: z.string().trim().min(1).max(REVIEW_REPLY_MAX),
  })
  .strict()
export type ReplyToReviewInput = z.infer<typeof ReplyToReviewInputSchema>

export const BookingReviewRefSchema = z.object({
  id: z.string().uuid(),
  status: ReviewStatusSchema,
  rating: z.number().int().min(1).max(5),
})
export type BookingReviewRef = z.infer<typeof BookingReviewRefSchema>

export const PublicReviewViewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  createdAt: z.string().datetime(),
  clientFirstName: z.string(),
  masterReply: z.string().nullable(),
  repliedAt: z.string().datetime().nullable(),
  verified: z.literal(true),
})
export type PublicReviewView = z.infer<typeof PublicReviewViewSchema>

export const PublicReviewListResponseSchema = z.object({
  items: z.array(PublicReviewViewSchema),
})
export type PublicReviewListResponse = z.infer<
  typeof PublicReviewListResponseSchema
>

export const ClientReviewViewSchema = PublicReviewViewSchema.extend({
  status: ReviewStatusSchema,
  bookingId: z.string().uuid(),
})
export type ClientReviewView = z.infer<typeof ClientReviewViewSchema>

export const CreateReviewResponseSchema = z.object({
  review: ClientReviewViewSchema,
})
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>

export const MasterReviewViewSchema = z.object({
  id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  status: ReviewStatusSchema,
  createdAt: z.string().datetime(),
  clientFirstName: z.string(),
  masterReply: z.string().nullable(),
  repliedAt: z.string().datetime().nullable(),
  verified: z.literal(true),
})
export type MasterReviewView = z.infer<typeof MasterReviewViewSchema>

export const MasterReviewListResponseSchema = z.object({
  items: z.array(MasterReviewViewSchema),
})
export type MasterReviewListResponse = z.infer<
  typeof MasterReviewListResponseSchema
>

export const ReplyToReviewResponseSchema = z.object({
  review: MasterReviewViewSchema,
})
export type ReplyToReviewResponse = z.infer<typeof ReplyToReviewResponseSchema>
