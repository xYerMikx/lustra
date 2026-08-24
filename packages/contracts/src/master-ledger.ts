import { z } from 'zod'

import { YmdDateSchema } from './master-schedule'

export const LedgerKindSchema = z.enum(['income', 'expense'])
export type LedgerKind = z.infer<typeof LedgerKindSchema>

export const LedgerSourceSchema = z.enum(['booking', 'manual'])
export type LedgerSource = z.infer<typeof LedgerSourceSchema>

export const LedgerPeriodPresetSchema = z.enum(['week', 'two_weeks', 'month'])
export type LedgerPeriodPreset = z.infer<typeof LedgerPeriodPresetSchema>

export const MoneyAmountInputSchema = z
  .string()
  .trim()
  .regex(/^\d+([.,]\d{1,2})?$/, 'Укажите сумму, например 50 или 50.00')
  .refine((value) => Number(value.replace(',', '.')) > 0, {
    message: 'Сумма должна быть больше нуля',
  })
export type MoneyAmountInput = z.infer<typeof MoneyAmountInputSchema>

const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  return value
}

export const ListLedgerQuerySchema = z
  .object({
    from: z.preprocess(emptyToUndefined, YmdDateSchema.optional()),
    to: z.preprocess(emptyToUndefined, YmdDateSchema.optional()),
    kind: z.preprocess(emptyToUndefined, LedgerKindSchema.optional()),
    categoryId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  })
  .strict()
export type ListLedgerQuery = z.infer<typeof ListLedgerQuerySchema>

export const CreateLedgerCategoryInputSchema = z
  .object({
    kind: LedgerKindSchema,
    name: z.string().trim().min(1, 'Укажите название').max(40),
  })
  .strict()
export type CreateLedgerCategoryInput = z.infer<
  typeof CreateLedgerCategoryInputSchema
>

export const CreateLedgerEntryInputSchema = z
  .object({
    kind: LedgerKindSchema,
    categoryId: z.string().uuid(),
    amount: MoneyAmountInputSchema,
    occurredOn: YmdDateSchema.optional(),
    periodStart: YmdDateSchema.optional(),
    periodEnd: YmdDateSchema.optional(),
    bookingId: z.string().uuid().optional(),
    note: z.string().trim().max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.periodStart && value.periodEnd && value.periodStart > value.periodEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Начало периода не может быть позже конца',
        path: ['periodEnd'],
      })
    }
  })
export type CreateLedgerEntryInput = z.infer<typeof CreateLedgerEntryInputSchema>

export const LedgerCategoryViewSchema = z.object({
  id: z.string().uuid(),
  kind: LedgerKindSchema,
  name: z.string(),
  slug: z.string(),
  isSystem: z.boolean(),
})
export type LedgerCategoryView = z.infer<typeof LedgerCategoryViewSchema>

export const LedgerEntryViewSchema = z.object({
  id: z.string().uuid(),
  kind: LedgerKindSchema,
  source: LedgerSourceSchema,
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  amount: z.string(),
  currency: z.string(),
  occurredOn: YmdDateSchema,
  occurredAt: z.string().datetime(),
  periodStart: YmdDateSchema.nullable(),
  periodEnd: YmdDateSchema.nullable(),
  bookingId: z.string().uuid().nullable(),
  note: z.string().nullable(),
  serviceTitle: z.string().nullable(),
})
export type LedgerEntryView = z.infer<typeof LedgerEntryViewSchema>

export const LedgerSummaryViewSchema = z.object({
  incomeTotal: z.string(),
  expenseTotal: z.string(),
  netTotal: z.string(),
  currency: z.string(),
})
export type LedgerSummaryView = z.infer<typeof LedgerSummaryViewSchema>

export const LedgerListResponseSchema = z.object({
  from: YmdDateSchema,
  to: YmdDateSchema,
  summary: LedgerSummaryViewSchema,
  categories: z.array(LedgerCategoryViewSchema),
  items: z.array(LedgerEntryViewSchema),
})
export type LedgerListResponse = z.infer<typeof LedgerListResponseSchema>

export const LedgerCategoryResponseSchema = z.object({
  category: LedgerCategoryViewSchema,
})
export type LedgerCategoryResponse = z.infer<typeof LedgerCategoryResponseSchema>

export const LedgerEntryResponseSchema = z.object({
  entry: LedgerEntryViewSchema,
})
export type LedgerEntryResponse = z.infer<typeof LedgerEntryResponseSchema>
