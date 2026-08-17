import { z } from 'zod'

export const PriceTypeSchema = z.enum(['fixed', 'from', 'range'])
export type PriceType = z.infer<typeof PriceTypeSchema>

const DurationMinSchema = z
  .number()
  .int()
  .positive()
  .refine((value) => value % 15 === 0, {
    message: 'Длительность должна быть кратна 15 минутам',
  })

const PriceAmountSchema = z
  .number()
  .positive()
  .finite()
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, {
    message: 'Цена — максимум 2 знака после запятой',
  })

export const ServiceCategoryViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  icon: z.string().nullable(),
  sort: z.number().int(),
  parentId: z.string().uuid().nullable(),
})
export type ServiceCategoryView = z.infer<typeof ServiceCategoryViewSchema>

export const ServiceCategoryListResponseSchema = z.object({
  categories: z.array(ServiceCategoryViewSchema),
})
export type ServiceCategoryListResponse = z.infer<
  typeof ServiceCategoryListResponseSchema
>

export const ServiceTemplateViewSchema = z.object({
  categorySlug: z.string(),
  title: z.string(),
  durationMin: z.number().int(),
  price: z.number(),
  priceType: PriceTypeSchema,
})
export type ServiceTemplateView = z.infer<typeof ServiceTemplateViewSchema>

export const ServiceTemplateListResponseSchema = z.object({
  templates: z.array(ServiceTemplateViewSchema),
})
export type ServiceTemplateListResponse = z.infer<
  typeof ServiceTemplateListResponseSchema
>

export const ServiceViewSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  categorySlug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  durationMin: z.number().int(),
  bufferAfterMin: z.number().int(),
  price: z.number(),
  priceMax: z.number().nullable(),
  priceType: PriceTypeSchema,
  currency: z.string(),
  isActive: z.boolean(),
  sort: z.number().int(),
})
export type ServiceView = z.infer<typeof ServiceViewSchema>

export const ServiceListResponseSchema = z.object({
  services: z.array(ServiceViewSchema),
})
export type ServiceListResponse = z.infer<typeof ServiceListResponseSchema>

const ServiceFieldsSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  durationMin: DurationMinSchema,
  bufferAfterMin: z.number().int().min(0).max(180).optional(),
  price: PriceAmountSchema,
  priceMax: PriceAmountSchema.nullable().optional(),
  priceType: PriceTypeSchema.optional(),
  isActive: z.boolean().optional(),
})

function refinePriceRange<T extends {
  priceType?: PriceType
  price?: number
  priceMax?: number | null
}>(
  value: T,
  ctx: z.RefinementCtx,
) {
  const priceType = value.priceType ?? 'fixed'
  if (priceType === 'range') {
    if (value.priceMax == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMax'],
        message: 'Для диапазона укажите максимальную цену',
      })
      return
    }
    if (value.price !== undefined && value.priceMax <= value.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMax'],
        message: 'Максимальная цена должна быть больше минимальной',
      })
    }
  }
}

export const CreateServiceInputSchema = ServiceFieldsSchema.strict().superRefine(
  refinePriceRange,
)
export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>

export const UpdateServiceInputSchema = ServiceFieldsSchema.partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Укажите хотя бы одно поле для обновления',
  })
  .superRefine(refinePriceRange)
export type UpdateServiceInput = z.infer<typeof UpdateServiceInputSchema>
