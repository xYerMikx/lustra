import { z } from 'zod'

import { GranularityMinSchema } from './master-schedule'

const YmdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')

export const AvailabilityQuerySchema = z
  .object({
    serviceId: z.string().uuid(),
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
export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>

export const AvailabilitySlotViewSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  slotIds: z.array(z.string().uuid()),
})
export type AvailabilitySlotView = z.infer<typeof AvailabilitySlotViewSchema>

export const AvailabilityDayViewSchema = z.object({
  date: YmdSchema,
  hasOpen: z.boolean(),
  slots: z.array(AvailabilitySlotViewSchema),
})
export type AvailabilityDayView = z.infer<typeof AvailabilityDayViewSchema>

export const AvailabilityResponseSchema = z.object({
  serviceId: z.string().uuid(),
  durationMin: z.number().int().positive(),
  granularityMin: GranularityMinSchema,
  timezone: z.string(),
  days: z.array(AvailabilityDayViewSchema),
})
export type AvailabilityResponse = z.infer<typeof AvailabilityResponseSchema>
