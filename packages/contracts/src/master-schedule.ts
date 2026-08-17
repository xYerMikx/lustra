import { z } from 'zod'

/** Local calendar date `YYYY-MM-DD` (Europe/Minsk). */
export const YmdDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
export type YmdDate = z.infer<typeof YmdDateSchema>

/** 1 = Mon … 7 = Sun (ISO weekday), local Europe/Minsk minutes of day */
export const WeekdaySchema = z.number().int().min(1).max(7)
export type Weekday = z.infer<typeof WeekdaySchema>

export const GranularityMinSchema = z.union([
  z.literal(15),
  z.literal(30),
  z.literal(60),
])
export type GranularityMin = z.infer<typeof GranularityMinSchema>

export function isGranularityMin(value: number): value is GranularityMin {
  return value === 15 || value === 30 || value === 60
}

export const AvailabilityRuleViewSchema = z.object({
  id: z.string().uuid(),
  weekday: WeekdaySchema,
  startMin: z.number().int(),
  endMin: z.number().int(),
})
export type AvailabilityRuleView = z.infer<typeof AvailabilityRuleViewSchema>

export const MasterSchedulePolicyViewSchema = z.object({
  granularityMin: GranularityMinSchema,
  /** Minimum lead time before a slot can be booked, in hours (UI-friendly). */
  leadTimeHours: z.number().int().min(0).max(168),
  /** How far ahead clients may book, in days. */
  horizonDays: z.number().int().min(1).max(90),
})
export type MasterSchedulePolicyView = z.infer<
  typeof MasterSchedulePolicyViewSchema
>

export const MasterScheduleViewSchema = z.object({
  rules: z.array(AvailabilityRuleViewSchema),
  policy: MasterSchedulePolicyViewSchema,
})
export type MasterScheduleView = z.infer<typeof MasterScheduleViewSchema>

export const AvailabilityRuleInputSchema = z
  .object({
    weekday: WeekdaySchema,
    startMin: z.number().int().min(0).max(1439),
    endMin: z.number().int().min(1).max(1440),
  })
  .strict()
  .superRefine((rule, ctx) => {
    if (rule.endMin <= rule.startMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMin'],
        message: 'Конец интервала должен быть позже начала',
      })
    }
  })
export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleInputSchema>

export const PutMasterScheduleInputSchema = z
  .object({
    rules: z.array(AvailabilityRuleInputSchema).max(21),
    policy: z
      .object({
        granularityMin: GranularityMinSchema.optional(),
        leadTimeHours: z.number().int().min(0).max(168).optional(),
        horizonDays: z.number().int().min(1).max(90).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
export type PutMasterScheduleInput = z.infer<typeof PutMasterScheduleInputSchema>

export const ExceptionTypeSchema = z.enum(['day_off', 'custom_hours'])
export type ExceptionType = z.infer<typeof ExceptionTypeSchema>

export const ScheduleExceptionViewSchema = z.object({
  id: z.string().uuid(),
  date: YmdDateSchema,
  type: ExceptionTypeSchema,
  startMin: z.number().int().min(0).max(1439).nullable(),
  endMin: z.number().int().min(1).max(1440).nullable(),
  note: z.string().nullable(),
})
export type ScheduleExceptionView = z.infer<typeof ScheduleExceptionViewSchema>

export const ScheduleExceptionListResponseSchema = z.object({
  items: z.array(ScheduleExceptionViewSchema),
})
export type ScheduleExceptionListResponse = z.infer<
  typeof ScheduleExceptionListResponseSchema
>

export const ListScheduleExceptionsQuerySchema = z
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
export type ListScheduleExceptionsQuery = z.infer<
  typeof ListScheduleExceptionsQuerySchema
>

export const PutScheduleExceptionInputSchema = z
  .object({
    type: ExceptionTypeSchema,
    startMin: z.number().int().min(0).max(1439).optional(),
    endMin: z.number().int().min(1).max(1440).optional(),
    note: z.string().max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type !== 'custom_hours') {
      return
    }

    if (value.startMin == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startMin'],
        message: 'Укажите начало особых часов',
      })
    }

    if (value.endMin == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMin'],
        message: 'Укажите конец особых часов',
      })
    }

    if (
      value.startMin != null &&
      value.endMin != null &&
      value.endMin <= value.startMin
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMin'],
        message: 'Конец интервала должен быть позже начала',
      })
    }
  })
export type PutScheduleExceptionInput = z.infer<
  typeof PutScheduleExceptionInputSchema
>
