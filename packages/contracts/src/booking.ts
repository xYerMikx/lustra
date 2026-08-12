import { z } from 'zod'

export const BookingStatusSchema = z.enum([
  'hold',
  'pending',
  'confirmed',
  'completed',
  'cancelled_by_client',
  'cancelled_by_master',
  'no_show',
  'expired',
])
export type BookingStatus = z.infer<typeof BookingStatusSchema>

export const HoldSlotInputSchema = z
  .object({
    masterId: z.string().uuid(),
    serviceId: z.string().uuid(),
    startsAt: z.string().datetime(),
  })
  .strict()
export type HoldSlotInput = z.infer<typeof HoldSlotInputSchema>

export const ConfirmBookingInputSchema = z
  .object({
    comment: z.string().trim().max(500).optional(),
  })
  .strict()
export type ConfirmBookingInput = z.infer<typeof ConfirmBookingInputSchema>

/** Client-facing booking DTO — never includes masterNote / trustScore. */
export const BookingClientViewSchema = z.object({
  id: z.string().uuid(),
  masterId: z.string().uuid(),
  serviceId: z.string().uuid().nullable(),
  serviceTitle: z.string(),
  serviceDurationMin: z.number().int().positive(),
  priceAmount: z.string(),
  currency: z.string(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: BookingStatusSchema,
  holdExpiresAt: z.string().datetime().nullable(),
  clientComment: z.string().nullable(),
  confirmedAt: z.string().datetime().nullable(),
})
export type BookingClientView = z.infer<typeof BookingClientViewSchema>

export const HoldSlotResponseSchema = z.object({
  bookingId: z.string().uuid(),
  holdExpiresAt: z.string().datetime(),
  summary: BookingClientViewSchema,
})
export type HoldSlotResponse = z.infer<typeof HoldSlotResponseSchema>

export const ConfirmBookingResponseSchema = z.object({
  booking: BookingClientViewSchema,
})
export type ConfirmBookingResponse = z.infer<typeof ConfirmBookingResponseSchema>
