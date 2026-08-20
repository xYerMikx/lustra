import { z } from 'zod'

import {
  GranularityMinSchema,
  ScheduleExceptionViewSchema,
  YmdDateSchema,
} from './master-schedule'

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
    from: YmdDateSchema,
    to: YmdDateSchema,
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
  clientName: z.string().nullable(),
  bookingId: z.string().uuid().nullable(),
})
export type MasterCalendarSlotView = z.infer<typeof MasterCalendarSlotViewSchema>

export const MasterCalendarViewSchema = z.object({
  timezone: z.string(),
  granularityMin: GranularityMinSchema,
  from: YmdDateSchema,
  to: YmdDateSchema,
  slots: z.array(MasterCalendarSlotViewSchema),
  blocks: z.array(TimeBlockViewSchema),
  exceptions: z.array(ScheduleExceptionViewSchema),
})
export type MasterCalendarView = z.infer<typeof MasterCalendarViewSchema>
