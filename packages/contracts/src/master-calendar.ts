import { z } from 'zod'

import { GranularityMinSchema } from './master-schedule'

const YmdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')

export const BlockReasonSchema = z.enum([
  'break',
  'lunch',
  'personal',
  'vacation',
  'sick',
  'travel',
  'other',
])
export type BlockReason = z.infer<typeof BlockReasonSchema>

export const TimeBlockViewSchema = z.object({
  id: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: BlockReasonSchema,
  note: z.string().nullable(),
})
export type TimeBlockView = z.infer<typeof TimeBlockViewSchema>

export const CreateTimeBlockInputSchema = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    reason: BlockReasonSchema.default('other'),
    note: z.string().max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (new Date(value.endsAt).getTime() <= new Date(value.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'Конец блока должен быть позже начала',
      })
    }
  })
export type CreateTimeBlockInput = z.infer<typeof CreateTimeBlockInputSchema>

export const MasterCalendarQuerySchema = z
  .object({
    from: YmdSchema,
    to: YmdSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.from > value.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['to'],
        message: 'Дата «to» должна быть не раньше «from»',
      })
    }
  })
export type MasterCalendarQuery = z.infer<typeof MasterCalendarQuerySchema>

export const MasterCalendarSlotStatusSchema = z.enum([
  'open',
  'held',
  'booked',
  'blocked',
])
export type MasterCalendarSlotStatus = z.infer<
  typeof MasterCalendarSlotStatusSchema
>

export const MasterCalendarSlotViewSchema = z.object({
  id: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: MasterCalendarSlotStatusSchema,
})
export type MasterCalendarSlotView = z.infer<typeof MasterCalendarSlotViewSchema>

export const MasterCalendarViewSchema = z.object({
  timezone: z.string(),
  granularityMin: GranularityMinSchema,
  from: YmdSchema,
  to: YmdSchema,
  slots: z.array(MasterCalendarSlotViewSchema),
  blocks: z.array(TimeBlockViewSchema),
})
export type MasterCalendarView = z.infer<typeof MasterCalendarViewSchema>
