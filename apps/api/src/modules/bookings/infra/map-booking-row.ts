import type { BookingReviewRef, BookingStatus } from '@lustra/contracts'

import type { BookingRecord } from '@/modules/bookings/domain/map-booking'

export const BOOKING_CABINET_SELECT = {
  id: true,
  masterId: true,
  clientUserId: true,
  serviceId: true,
  serviceTitle: true,
  serviceDurationMin: true,
  priceAmount: true,
  currency: true,
  startsAt: true,
  endsAt: true,
  status: true,
  holdExpiresAt: true,
  clientComment: true,
  confirmedAt: true,
  completedAt: true,
  review: {
    select: {
      id: true,
      status: true,
      rating: true,
    },
  },
  masterNote: true,
  master: {
    select: {
      displayName: true,
      locations: {
        where: { isPrimary: true },
        take: 1,
        select: {
          addressHint: true,
          addressExact: true,
        },
      },
    },
  },
  masterClient: {
    select: {
      name: true,
      phone: true,
      note: true,
    },
  },
} as const

type BookingCabinetRow = {
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
  master: {
    displayName: string
    locations: Array<{
      addressHint: string | null
      addressExact: string | null
    }>
  }
  masterClient: {
    name: string
    phone: string | null
    note: string | null
  }
}

export function mapBookingRow(row: BookingCabinetRow): BookingRecord {
  const location = row.master.locations[0] ?? null

  return {
    id: row.id,
    masterId: row.masterId,
    clientUserId: row.clientUserId,
    serviceId: row.serviceId,
    serviceTitle: row.serviceTitle,
    serviceDurationMin: row.serviceDurationMin,
    priceAmount: row.priceAmount,
    currency: row.currency,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status,
    holdExpiresAt: row.holdExpiresAt,
    clientComment: row.clientComment,
    confirmedAt: row.confirmedAt,
    completedAt: row.completedAt,
    review: row.review,
    masterNote: row.masterNote,
    masterDisplayName: row.master.displayName,
    addressHint: location?.addressHint ?? null,
    addressExact: location?.addressExact ?? null,
    clientName: row.masterClient.name,
    clientPhone: row.masterClient.phone,
    clientNote: row.masterClient.note,
  }
}
