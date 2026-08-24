import type {
  ClientReviewView,
  MasterReviewView,
  PublicReviewView,
  ReceivedClientReviewView,
  ReviewAuthorRole,
  ReviewStatus,
} from '@lustra/contracts'

export type ReviewRecord = {
  id: string
  bookingId: string
  masterId: string
  authorRole: ReviewAuthorRole
  serviceTitle: string
  rating: number | null
  text: string | null
  status: ReviewStatus
  createdAt: Date
  masterReply: string | null
  repliedAt: Date | null
  clientFirstName: string
  masterDisplayName: string
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

function requireRating(rating: number | null): number {
  if (rating == null) {
    return 1
  }

  return rating
}

export function toPublicReviewView(record: ReviewRecord): PublicReviewView {
  return {
    id: record.id,
    rating: requireRating(record.rating),
    text: record.text,
    createdAt: record.createdAt.toISOString(),
    clientFirstName: publicName(record.clientFirstName),
    serviceTitle: record.serviceTitle,
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
    rating: requireRating(record.rating),
    text: record.text,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    clientFirstName: publicName(record.clientFirstName),
    serviceTitle: record.serviceTitle,
    masterReply: record.masterReply,
    repliedAt: toIso(record.repliedAt),
    verified: true,
  }
}

export function toReceivedClientReviewView(
  record: ReviewRecord,
): ReceivedClientReviewView {
  return {
    id: record.id,
    rating: record.rating,
    text: record.text,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    masterDisplayName: record.masterDisplayName,
    serviceTitle: record.serviceTitle,
    verified: true,
  }
}