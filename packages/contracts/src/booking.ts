import { z } from 'zod'

import { OptionalByPhoneSchema } from './phone'
import { BookingReviewRefSchema } from './review'
import {
  InstagramHandleSchema,
  TelegramHandleSchema,
} from './social-handle'

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

export const RescheduleBookingInputSchema = z
  .object({
    startsAt: z.string().datetime(),
    reason: z.string().trim().min(1).max(500),
  })
  .strict()
export type RescheduleBookingInput = z.infer<typeof RescheduleBookingInputSchema>

export const MANUAL_BOOKING_CHANNELS = [
  'instagram',
  'telegram',
  'phone',
  'walk_in',
  'other',
] as const

export const ManualBookingChannelSchema = z.enum(MANUAL_BOOKING_CHANNELS)
export type ManualBookingChannel = z.infer<typeof ManualBookingChannelSchema>

export const ContactChannelSchema = z.enum([
  'instagram',
  'telegram',
  'phone',
  'walk_in',
  'site',
  'other',
])
export type ContactChannel = z.infer<typeof ContactChannelSchema>

export const SOCIAL_IDENTITY_NETWORKS = ['instagram', 'telegram'] as const
export const SocialIdentityNetworkSchema = z.enum(SOCIAL_IDENTITY_NETWORKS)
export type SocialIdentityNetwork = z.infer<typeof SocialIdentityNetworkSchema>

const RequiredSocialHandleSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string' && value.trim() === '') {
    return undefined
  }

  return value
}, z.string().trim().min(1, 'Укажите ник в Instagram или Telegram').max(40))

export const CreateManualBookingInputSchema = z
  .object({
    serviceId: z.string().uuid(),
    startsAt: z.string().datetime(),
    clientName: z.string().trim().min(1, 'Укажите имя').max(80),
    phone: OptionalByPhoneSchema,
    channel: ManualBookingChannelSchema,
    identityNetwork: SocialIdentityNetworkSchema,
    socialHandle: RequiredSocialHandleSchema,
    note: z.string().trim().max(500).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const parsed =
      value.identityNetwork === 'telegram'
        ? TelegramHandleSchema.safeParse(value.socialHandle)
        : InstagramHandleSchema.safeParse(value.socialHandle)

    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['socialHandle'],
        message: parsed.error.issues[0]?.message ?? 'Проверьте ник',
      })
    }
  })
  .transform((value) => {
    const parsed =
      value.identityNetwork === 'telegram'
        ? TelegramHandleSchema.parse(value.socialHandle)
        : InstagramHandleSchema.parse(value.socialHandle)

    return {
      ...value,
      socialHandle: parsed,
    }
  })
export type CreateManualBookingInput = z.infer<
  typeof CreateManualBookingInputSchema
>

export const ListMasterClientsQuerySchema = z
  .object({
    query: z.string().trim().max(80).default(''),
    sort: z.enum(['recent', 'frequent']).default('recent'),
  })
  .strict()
export type ListMasterClientsQuery = z.infer<
  typeof ListMasterClientsQuerySchema
>

export const MasterClientViewSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable(),
  source: ContactChannelSchema.nullable(),
  socialHandle: z.string().nullable(),
  visitsCount: z.number().int().nonnegative(),
  lastVisitAt: z.string().datetime().nullable(),
})
export type MasterClientView = z.infer<typeof MasterClientViewSchema>

export const MasterClientListResponseSchema = z.object({
  items: z.array(MasterClientViewSchema),
})
export type MasterClientListResponse = z.infer<
  typeof MasterClientListResponseSchema
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
  completedAt: z.string().datetime().nullable(),
  review: BookingReviewRefSchema.nullable(),
  receivedReview: BookingReviewRefSchema.nullable(),
  addressHint: z.string().nullable(),
  /** Exact address only when status is confirmed. */
  addressExact: z.string().nullable(),
})
export type BookingClientView = z.infer<typeof BookingClientViewSchema>

export const BookingMasterClientSchema = z.object({
  name: z.string(),
  phone: z.string().nullable(),
  note: z.string().nullable(),
  socialHandle: z.string().nullable(),
  source: ContactChannelSchema.nullable(),
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
  completedAt: z.string().datetime().nullable(),
  masterNote: z.string().nullable(),
  channel: ContactChannelSchema.nullable(),
  client: BookingMasterClientSchema,
  review: BookingReviewRefSchema.nullable(),
  clientReview: BookingReviewRefSchema.nullable(),
  clientHasAccount: z.boolean(),
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
