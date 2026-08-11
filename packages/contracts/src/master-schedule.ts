import { z } from 'zod'

/** 1 = Mon … 7 = Sun (ISO weekday), local Europe/Minsk minutes of day */
export const WeekdaySchema = z.number().int().min(1).max(7)
export type Weekday = z.infer<typeof WeekdaySchema>

export const GranularityMinSchema = z.union([
  z.literal(15),
  z.literal(30),
  z.literal(60),
])
export type GranularityMin = z.infer<typeof GranularityMinSchema>

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
