import { z } from 'zod'

import { CatalogMasterCardSchema } from './catalog'

export const FavoriteListResponseSchema = z
  .object({
    items: z.array(CatalogMasterCardSchema),
  })
  .strict()
export type FavoriteListResponse = z.infer<typeof FavoriteListResponseSchema>

export const FavoriteStatusResponseSchema = z
  .object({
    favorited: z.boolean(),
  })
  .strict()
export type FavoriteStatusResponse = z.infer<typeof FavoriteStatusResponseSchema>
