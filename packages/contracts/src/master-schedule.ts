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

export const ScheduleIntervalSchema = z
  .object({
    startMin: z.number().int().min(0).max(1439),
    endMin: z.number().int().min(1).max(1440),
  })
  .strict()
  .superRefine((interval, ctx) => {
    if (interval.endMin <= interval.startMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMin'],
        message: 'Конец интервала должен быть позже начала',
      })
    }
  })
export type ScheduleInterval = z.infer<typeof ScheduleIntervalSchema>

export const ScheduleExceptionViewSchema = z.object({
  id: z.string().uuid(),
  date: YmdDateSchema,
  type: ExceptionTypeSchema,
  startMin: z.number().int().min(0).max(1439).nullable(),
  endMin: z.number().int().min(1).max(1440).nullable(),
  granularityMin: GranularityMinSchema.nullable(),
  intervals: z.array(ScheduleIntervalSchema).nullable(),
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
    granularityMin: GranularityMinSchema.optional(),
    intervals: z.array(ScheduleIntervalSchema).min(1).max(8).optional(),
    untilDate: YmdDateSchema.optional(),
    note: z.string().max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type !== 'custom_hours') {
      return
    }

    const intervals = resolveCustomHoursIntervals(value)

    if (intervals.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startMin'],
        message: 'Укажите рабочие окна дня',
      })

      return
    }

    for (let index = 1; index < intervals.length; index += 1) {
      const prev = intervals[index - 1]
      const current = intervals[index]

      if (!prev || !current) {
        continue
      }

      if (current.startMin < prev.endMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['intervals', index, 'startMin'],
          message: 'Окна не должны пересекаться',
        })
      }
    }
  })
export type PutScheduleExceptionInput = z.infer<
  typeof PutScheduleExceptionInputSchema
>

export function resolveCustomHoursIntervals(input: {
  startMin?: number
  endMin?: number
  intervals?: Array<{ startMin: number; endMin: number }>
}): Array<{ startMin: number; endMin: number }> {
  if (input.intervals && input.intervals.length > 0) {
    return [...input.intervals].sort((left, right) => left.startMin - right.startMin)
  }

  if (
    input.startMin == null ||
    input.endMin == null ||
    input.endMin <= input.startMin
  ) {
    return []
  }

  return [{ startMin: input.startMin, endMin: input.endMin }]
}
