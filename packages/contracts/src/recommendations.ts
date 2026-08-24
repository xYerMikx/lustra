import { z } from 'zod'

export const RecommendedMasterRefSchema = z
  .object({
    id: z.string().uuid(),
    slug: z.string(),
    displayName: z.string(),
  })
  .strict()
export type RecommendedMasterRef = z.infer<typeof RecommendedMasterRefSchema>

export const RecommendedServiceViewSchema = z
  .object({
    serviceTitle: z.string(),
    serviceId: z.string().uuid().nullable(),
    categoryId: z.string().uuid().nullable(),
    completedCount: z.number().int().positive(),
    lastCompletedAt: z.string().datetime(),
    lastMaster: RecommendedMasterRefSchema.nullable(),
  })
  .strict()
export type RecommendedServiceView = z.infer<typeof RecommendedServiceViewSchema>

export const ClientRecommendationsResponseSchema = z
  .object({
    services: z.array(RecommendedServiceViewSchema).max(3),
  })
  .strict()
export type ClientRecommendationsResponse = z.infer<
  typeof ClientRecommendationsResponseSchema
>
