import type {
  BookingClientView,
  BookingMasterView,
  BookingReviewRef,
  BookingStatus,
  ContactChannel,
} from '@lustra/contracts'

import { socialHandleFromNote } from '@/modules/bookings/domain/social-handle-note'

export type BookingRecord = {
  id: string
  masterId: string
  clientUserId: string | null
  serviceId: string | null
  serviceTitle: string
  serviceDurationMin: number
  priceAmount: { toString(): string } | string
  currency: string
  startsAt: Date
  endsAt: Date
  status: BookingStatus
  holdExpiresAt: Date | null
  clientComment: string | null
  confirmedAt: Date | null
  completedAt: Date | null
  review: BookingReviewRef | null
  masterNote: string | null
  channel: ContactChannel | null
  masterDisplayName: string
  addressHint: string | null
  addressExact: string | null
  clientName: string
  clientPhone: string | null
  clientNote: string | null
  clientSource: ContactChannel | null
}

const PRIVATE_CLIENT_KEYS = ['masterNote', 'trustScore'] as const

export function toBookingClientView(record: BookingRecord): BookingClientView {
  const showExact = record.status === 'confirmed'

  return {
    id: record.id,
    masterId: record.masterId,
    masterDisplayName: record.masterDisplayName,
    serviceId: record.serviceId,
    serviceTitle: record.serviceTitle,
    serviceDurationMin: record.serviceDurationMin,
    priceAmount: String(record.priceAmount),
    currency: record.currency,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    status: record.status,
    holdExpiresAt: record.holdExpiresAt
      ? record.holdExpiresAt.toISOString()
      : null,
    clientComment: record.clientComment,
    confirmedAt: record.confirmedAt
      ? record.confirmedAt.toISOString()
      : null,
    completedAt: record.completedAt
      ? record.completedAt.toISOString()
      : null,
    review: record.review,
    addressHint: record.addressHint,
    addressExact: showExact ? record.addressExact : null,
  }
}

export function toBookingMasterView(record: BookingRecord): BookingMasterView {
  return {
    id: record.id,
    masterId: record.masterId,
    serviceId: record.serviceId,
    serviceTitle: record.serviceTitle,
    serviceDurationMin: record.serviceDurationMin,
    priceAmount: String(record.priceAmount),
    currency: record.currency,
    startsAt: record.startsAt.toISOString(),
    endsAt: record.endsAt.toISOString(),
    status: record.status,
    holdExpiresAt: record.holdExpiresAt
      ? record.holdExpiresAt.toISOString()
      : null,
    clientComment: record.clientComment,
    confirmedAt: record.confirmedAt
      ? record.confirmedAt.toISOString()
      : null,
    completedAt: record.completedAt
      ? record.completedAt.toISOString()
      : null,
    masterNote: record.masterNote,
    channel: record.channel,
    client: {
      name: record.clientName,
      phone: record.clientPhone,
      note: record.clientNote,
      socialHandle: socialHandleFromNote(record.clientNote),
      source: record.clientSource,
    },
  }
}

export function assertNoPrivateBookingKeys(view: BookingClientView): void {
  const keys = Object.keys(view)

  for (const privateKey of PRIVATE_CLIENT_KEYS) {
    if (keys.includes(privateKey)) {
      throw new Error(`Private key leaked: ${privateKey}`)
    }
  }
}
