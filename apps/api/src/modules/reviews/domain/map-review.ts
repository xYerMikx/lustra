import type {
  ClientReviewView,
  MasterReviewView,
  PublicReviewView,
  ReviewStatus,
} from '@lustra/contracts'

export type ReviewRecord = {
  id: string
  bookingId: string
  masterId: string
  rating: number
  text: string | null
  status: ReviewStatus
  createdAt: Date
  masterReply: string | null
  repliedAt: Date | null
  clientFirstName: string
}

function publicName(firstName: string): string {
  const trimmed = firstName.trim()

  return trimmed.length > 0 ? trimmed : 'Клиент'
}

function toIso(value: Date | null): string | null {
  if (!value) {
    return null
  }

  return value.toISOString()
}

export function toPublicReviewView(record: ReviewRecord): PublicReviewView {
  return {
    id: record.id,
    rating: record.rating,
    text: record.text,
    createdAt: record.createdAt.toISOString(),
    clientFirstName: publicName(record.clientFirstName),
    masterReply: record.masterReply,
    repliedAt: toIso(record.repliedAt),
    verified: true,
  }
}

export function toClientReviewView(record: ReviewRecord): ClientReviewView {
  return {
    ...toPublicReviewView(record),
    status: record.status,
    bookingId: record.bookingId,
  }
}

export function toMasterReviewView(record: ReviewRecord): MasterReviewView {
  return {
    id: record.id,
    rating: record.rating,
    text: record.text,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    clientFirstName: publicName(record.clientFirstName),
    masterReply: record.masterReply,
    repliedAt: toIso(record.repliedAt),
    verified: true,
  }
}
