import { z } from 'zod'

import { MasterProfileStatusSchema } from './auth'

export const ModerateMasterActionSchema = z.enum([
  'approve',
  'reject',
  'hide',
  'ban',
])
export type ModerateMasterAction = z.infer<typeof ModerateMasterActionSchema>

export const AdminListMastersQuerySchema = z
  .object({
    status: MasterProfileStatusSchema.default('pending_review'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict()
export type AdminListMastersQuery = z.infer<typeof AdminListMastersQuerySchema>

export const AdminMasterCardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  status: MasterProfileStatusSchema,
  districtName: z.string().nullable(),
  updatedAt: z.string().datetime(),
})
export type AdminMasterCard = z.infer<typeof AdminMasterCardSchema>

export const AdminListMastersResponseSchema = z.object({
  items: z.array(AdminMasterCardSchema),
})
export type AdminListMastersResponse = z.infer<
  typeof AdminListMastersResponseSchema
>

export const ModerateMasterInputSchema = z
  .object({
    action: ModerateMasterActionSchema,
    comment: z.string().trim().max(500).optional(),
  })
  .strict()
export type ModerateMasterInput = z.infer<typeof ModerateMasterInputSchema>

export const ModerateMasterResponseSchema = z.object({
  master: AdminMasterCardSchema,
})
export type ModerateMasterResponse = z.infer<
  typeof ModerateMasterResponseSchema
>
