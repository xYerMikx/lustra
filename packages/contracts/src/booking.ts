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

export const CancelBookingInputSchema = z
  .object({
    reason: z.string().trim().max(500).optional(),
  })
  .strict()
export type CancelBookingInput = z.infer<typeof CancelBookingInputSchema>

export const MasterCancelBookingInputSchema = z
  .object({
    reason: z.string().trim().min(1).max(500),
  })
  .strict()
export type MasterCancelBookingInput = z.infer<
  typeof MasterCancelBookingInputSchema
>

export const ListBookingsQuerySchema = z
  .object({
    scope: z.enum(['upcoming', 'past']).default('upcoming'),
  })
  .strict()
export type ListBookingsQuery = z.infer<typeof ListBookingsQuerySchema>

export const MasterListBookingsQuerySchema = z
  .object({
    scope: z.enum(['upcoming', 'past', 'pending']).default('upcoming'),
  })
  .strict()
export type MasterListBookingsQuery = z.infer<
  typeof MasterListBookingsQuerySchema
>

/** Client-facing booking DTO — never includes masterNote / trustScore. */
export const BookingClientViewSchema = z.object({
  id: z.string().uuid(),
  masterId: z.string().uuid(),
  masterDisplayName: z.string(),
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
  addressHint: z.string().nullable(),
  /** Exact address only when status is confirmed. */
  addressExact: z.string().nullable(),
})
export type BookingClientView = z.infer<typeof BookingClientViewSchema>

export const BookingMasterClientSchema = z.object({
  name: z.string(),
  phone: z.string().nullable(),
  note: z.string().nullable(),
})
export type BookingMasterClient = z.infer<typeof BookingMasterClientSchema>

export const BookingMasterViewSchema = z.object({
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
  masterNote: z.string().nullable(),
  client: BookingMasterClientSchema,
})
export type BookingMasterView = z.infer<typeof BookingMasterViewSchema>

export const BookingListResponseSchema = z.object({
  items: z.array(BookingClientViewSchema),
})
export type BookingListResponse = z.infer<typeof BookingListResponseSchema>

export const MasterBookingListResponseSchema = z.object({
  items: z.array(BookingMasterViewSchema),
})
export type MasterBookingListResponse = z.infer<
  typeof MasterBookingListResponseSchema
>

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

export const CancelBookingResponseSchema = z.object({
  booking: BookingClientViewSchema,
})
export type CancelBookingResponse = z.infer<typeof CancelBookingResponseSchema>

export const MasterBookingResponseSchema = z.object({
  booking: BookingMasterViewSchema,
})
export type MasterBookingResponse = z.infer<typeof MasterBookingResponseSchema>
