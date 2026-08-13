import { z } from 'zod'

export const PORTFOLIO_MAX_ITEMS = 60
export const PORTFOLIO_MAX_BYTES = 8 * 1024 * 1024

export const CreatePortfolioQuerySchema = z
  .object({
    caption: z.string().trim().max(200).optional(),
    serviceId: z.string().uuid().optional(),
  })
  .strict()
export type CreatePortfolioQuery = z.infer<typeof CreatePortfolioQuerySchema>

export const PatchPortfolioItemInputSchema = z
  .object({
    caption: z.string().trim().max(200).nullable(),
    serviceId: z.string().uuid().nullable(),
    isCover: z.boolean(),
    sort: z.number().int().min(0).max(10_000),
  })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Укажите хотя бы одно поле для обновления',
  })
export type PatchPortfolioItemInput = z.infer<
  typeof PatchPortfolioItemInputSchema
>

export const PortfolioItemViewSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: z.string().nullable(),
  serviceId: z.string().uuid().nullable(),
  sort: z.number().int(),
  isCover: z.boolean(),
})
export type PortfolioItemView = z.infer<typeof PortfolioItemViewSchema>

export const PortfolioListResponseSchema = z.object({
  items: z.array(PortfolioItemViewSchema),
})
export type PortfolioListResponse = z.infer<typeof PortfolioListResponseSchema>
