import type { BookingStatus, ContactChannel, ManualBookingChannel } from '@lustra/contracts'

import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import type { HoldableSlotRow } from '@/modules/bookings/domain/slot-holdability'

export type BookingPolicyRecord = {
  granularityMin: number
  minLeadTimeMin: number
  maxHorizonDays: number
  bufferAfterMin: number
  holdTtlSec: number
  autoConfirm: boolean
  maxActiveBookingsPerClient: number
  clientCancelCutoffMin: number
}

export type BookingServiceRecord = {
  id: string
  masterId: string
  title: string
  durationMin: number
  bufferAfterMin: number
  price: { toString(): string } | string
  currency: string
  isActive: boolean
}

export type BookingClientUser = {
  id: string
  firstName: string
  phone: string | null
}

export type CreateHoldInput = {
  masterId: string
  masterClientId: string
  clientUserId: string
  serviceId: string
  serviceTitle: string
  serviceDurationMin: number
  bufferMin: number
  priceAmount: string
  currency: string
  startsAt: Date
  endsAt: Date
  holdId: string
  holdExpiresAt: Date
  idempotencyKey: string
  slotIds: string[]
  now: Date
}

export type ConfirmHoldInput = {
  bookingId: string
  clientUserId: string
  toStatus: Extract<BookingStatus, 'pending' | 'confirmed'>
  clientComment: string | null
  confirmedAt: Date | null
  now: Date
}

export type CancelBookingStoreInput = {
  bookingId: string
  toStatus: Extract<BookingStatus, 'cancelled_by_client' | 'cancelled_by_master'>
  cancelledByType: 'client' | 'master'
  currentUserId: string
  reason: string | null
  now: Date
}

export type ConfirmPendingStoreInput = {
  bookingId: string
  masterId: string
  currentUserId: string
  now: Date
}

export type CompleteBookingStoreInput = {
  bookingId: string
  masterId: string
  currentUserId: string
  now: Date
}

export type MarkNoShowStoreInput = {
  bookingId: string
  masterId: string
  currentUserId: string
  fromStatus: Extract<BookingStatus, 'pending' | 'confirmed'>
  clientUserId: string | null
  now: Date
}

export type CreateManualBookingStoreInput = {
  masterId: string
  currentUserId: string
  serviceId: string
  serviceTitle: string
  serviceDurationMin: number
  bufferMin: number
  priceAmount: string
  currency: string
  startsAt: Date
  endsAt: Date
  coverageEnd: Date
  granularityMin: number
  channel: ManualBookingChannel
  clientName: string
  phone: string
  socialHandle: string | null
  masterNote: string | null
  now: Date
}

export type RescheduleBookingStoreInput = {
  bookingId: string
  masterId: string
  currentUserId: string
  startsAt: Date
  endsAt: Date
  coverageEnd: Date
  granularityMin: number
  bufferMin: number
  reason: string
  now: Date
}

export type MasterClientRecord = {
  id: string
  name: string
  phone: string | null
  source: ContactChannel | null
  socialHandle: string | null
}

export type ListBookingsScope = 'upcoming' | 'past' | 'pending'

export type BookingStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  findMasterPubliclyVisible(masterId: string): Promise<boolean>
  findService(
    masterId: string,
    serviceId: string,
  ): Promise<BookingServiceRecord | null>
  getPolicy(masterId: string): Promise<BookingPolicyRecord | null>
  findClientUser(userId: string): Promise<BookingClientUser | null>
  findBookingByIdempotencyKey(key: string): Promise<BookingRecord | null>
  findBookingById(id: string): Promise<BookingRecord | null>
  listBookingsForClient(input: {
    clientUserId: string
    scope: Exclude<ListBookingsScope, 'pending'>
    now: Date
    limit?: number
  }): Promise<BookingRecord[]>
  listBookingsForMaster(input: {
    masterId: string
    scope: ListBookingsScope
    now: Date
    limit?: number
  }): Promise<BookingRecord[]>
  countActiveBookingsForClient(
    masterId: string,
    clientUserId: string,
  ): Promise<number>
  upsertMasterClient(input: {
    masterId: string
    userId: string
    name: string
    phone: string | null
  }): Promise<{ id: string; isBlocked: boolean }>
  listGranulesInRange(input: {
    masterId: string
    rangeStart: Date
    rangeEndExclusive: Date
  }): Promise<HoldableSlotRow[]>
  createHold(input: CreateHoldInput): Promise<BookingRecord>
  confirmHold(input: ConfirmHoldInput): Promise<BookingRecord | null>
  cancelBooking(input: CancelBookingStoreInput): Promise<BookingRecord | null>
  confirmPending(input: ConfirmPendingStoreInput): Promise<BookingRecord | null>
  completeBooking(input: CompleteBookingStoreInput): Promise<BookingRecord | null>
  markNoShow(input: MarkNoShowStoreInput): Promise<BookingRecord | null>
  listMasterClients(input: {
    masterId: string
    query: string
    limit?: number
  }): Promise<MasterClientRecord[]>
  createManualBooking(
    input: CreateManualBookingStoreInput,
  ): Promise<BookingRecord>
  rescheduleBooking(
    input: RescheduleBookingStoreInput,
  ): Promise<BookingRecord | null>
}
