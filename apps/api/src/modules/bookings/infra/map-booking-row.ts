import type {
  BookingReviewRef,
  BookingStatus,
  ContactChannel,
} from '@lustra/contracts'

import { resolveStoredSocialHandle } from '@/modules/bookings/domain/guest-lookup-plan'
import type { BookingRecord } from '@/modules/bookings/domain/map-booking'
import { socialHandleFromNote } from '@/modules/bookings/domain/social-handle-note'

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
  reviews: {
    select: {
      id: true,
      status: true,
      rating: true,
      authorRole: true,
    },
  },
  masterNote: true,
  channel: true,
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
      source: true,
      instagramHandle: true,
      telegramHandle: true,
    },
  },
} as const

type BookingReviewRow = {
  id: string
  status: BookingReviewRef['status']
  rating: number | null
  authorRole: 'client' | 'master'
}

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
  reviews: BookingReviewRow[]
  masterNote: string | null
  channel: ContactChannel | null
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
    source: ContactChannel | null
    instagramHandle: string | null
    telegramHandle: string | null
  }
}

function pickReviewRef(
  reviews: BookingReviewRow[],
  authorRole: BookingReviewRow['authorRole'],
): BookingReviewRef | null {
  const match = reviews.find((item) => item.authorRole === authorRole)

  if (!match) {
    return null
  }

  return {
    id: match.id,
    status: match.status,
    rating: match.rating,
  }
}

export function mapBookingRow(row: BookingCabinetRow): BookingRecord {
  const location = row.master.locations[0] ?? null
  const clientReview = pickReviewRef(row.reviews, 'client')
  const masterReview = pickReviewRef(row.reviews, 'master')

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
    review: clientReview,
    receivedReview: masterReview,
    clientReview: masterReview,
    clientHasAccount: Boolean(row.clientUserId),
    masterNote: row.masterNote,
    channel: row.channel,
    masterDisplayName: row.master.displayName,
    addressHint: location?.addressHint ?? null,
    addressExact: location?.addressExact ?? null,
    clientName: row.masterClient.name,
    clientPhone: row.masterClient.phone,
    clientNote: row.masterClient.note,
    clientSocialHandle: resolveStoredSocialHandle({
      instagramHandle: row.masterClient.instagramHandle,
      telegramHandle: row.masterClient.telegramHandle,
      note: row.masterClient.note,
      socialHandleFromNote,
    }),
    clientSource: row.masterClient.source,
  }
}
