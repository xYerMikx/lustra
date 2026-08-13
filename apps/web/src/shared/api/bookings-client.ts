import type {
  BookingClientView,
  BookingListResponse,
  BookingMasterView,
  CancelBookingInput,
  CancelBookingResponse,
  ConfirmBookingInput,
  ConfirmBookingResponse,
  CreateManualBookingInput,
  HoldSlotInput,
  HoldSlotResponse,
  MasterBookingListResponse,
  MasterBookingResponse,
  MasterCancelBookingInput,
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

export function listClientBookings(scope: 'upcoming' | 'past' = 'upcoming') {
  const query = new URLSearchParams({ scope })

  return apiFetch<BookingListResponse>(`/bookings?${query.toString()}`)
}

export function getClientBooking(bookingId: string) {
  return apiFetch<ConfirmBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}`,
  )
}

export function cancelClientBooking(
  bookingId: string,
  input: CancelBookingInput = {},
) {
  return apiFetch<CancelBookingResponse>(
    `/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export function listMasterBookings(
  scope: 'upcoming' | 'past' | 'pending' = 'upcoming',
) {
  const query = new URLSearchParams({ scope })

  return apiFetch<MasterBookingListResponse>(
    `/master/bookings?${query.toString()}`,
  )
}

export function getMasterBooking(bookingId: string) {
  return apiFetch<MasterBookingResponse>(
    `/master/bookings/${encodeURIComponent(bookingId)}`,
  )
}

export function confirmMasterBooking(bookingId: string) {
  return apiFetch<MasterBookingResponse>(
    `/master/bookings/${encodeURIComponent(bookingId)}/confirm`,
    { method: 'POST' },
  )
}

export function completeMasterBooking(bookingId: string) {
  return apiFetch<MasterBookingResponse>(
    `/master/bookings/${encodeURIComponent(bookingId)}/complete`,
    { method: 'POST' },
  )
}

export function cancelMasterBooking(
  bookingId: string,
  input: MasterCancelBookingInput,
) {
  return apiFetch<MasterBookingResponse>(
    `/master/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export function createManualBooking(input: CreateManualBookingInput) {
  return apiFetch<MasterBookingResponse>('/master/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export type { BookingClientView, BookingMasterView }
