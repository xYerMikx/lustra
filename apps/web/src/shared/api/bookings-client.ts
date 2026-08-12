import type {
  ConfirmBookingInput,
  ConfirmBookingResponse,
  HoldSlotInput,
  HoldSlotResponse,
} from '@lustra/contracts'

import { apiFetch } from '@/shared/api/http'

export function createBookingHold(
  input: HoldSlotInput,
  idempotencyKey: string,
) {
  return apiFetch<HoldSlotResponse>('/bookings/holds', {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
  })
}

export function confirmBooking(
  bookingId: string,
  input: ConfirmBookingInput = {},
) {
  return apiFetch<ConfirmBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/confirm`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}
