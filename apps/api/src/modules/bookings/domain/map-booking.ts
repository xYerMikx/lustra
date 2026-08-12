import type { BookingClientView, BookingStatus } from '@lustra/contracts'

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
  masterNote: string | null
}

const PRIVATE_BOOKING_KEYS = ['masterNote', 'trustScore'] as const

export function toBookingClientView(record: BookingRecord): BookingClientView {
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
  }
}

export function assertNoPrivateBookingKeys(view: BookingClientView): void {
  const keys = Object.keys(view)

  for (const privateKey of PRIVATE_BOOKING_KEYS) {
    if (keys.includes(privateKey)) {
      throw new Error(`Private key leaked: ${privateKey}`)
    }
  }
}
