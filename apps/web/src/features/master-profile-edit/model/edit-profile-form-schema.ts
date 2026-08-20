import { z } from 'zod'
import {
  LocationTypeSchema,
  MasterSlugSchema,
} from '@lustra/contracts'

export const EditMasterProfileFormSchema = z
  .object({
    displayName: z.string().trim().min(1, 'Укажите имя').max(80),
    slug: MasterSlugSchema,
    headline: z.string().trim().max(120),
    bio: z.string().trim().max(1000),
    districtId: z.string().uuid('Выберите район'),
    locationType: LocationTypeSchema,
    addressHint: z.string().trim().max(200),
    publicPhone: z.string(),
    instagram: z.string(),
    telegramUsername: z.string(),
    website: z.string(),
  })
  .strict()

export type EditMasterProfileFormValues = z.infer<
  typeof EditMasterProfileFormSchema
>
