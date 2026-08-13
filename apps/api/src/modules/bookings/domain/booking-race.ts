import {
  BOOKING_NO_OVERLAP,
  PRISMA_ERROR,
} from '@/common/db/prisma-error-codes'

type PrismaLikeError = {
  code?: unknown
  meta?: { constraint?: unknown; target?: unknown }
  message?: unknown
}

function asPrismaLike(error: unknown): PrismaLikeError | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  return error
}

function constraintMentionsOverlap(known: PrismaLikeError): boolean {
  const constraint = known.meta?.constraint

  if (Array.isArray(constraint)) {
    return constraint.includes(BOOKING_NO_OVERLAP)
  }

  if (typeof constraint === 'string') {
    return constraint === BOOKING_NO_OVERLAP
  }

  return (
    typeof known.message === 'string' &&
    known.message.includes(BOOKING_NO_OVERLAP)
  )
}

export function isBookingUniqueRace(error: unknown): boolean {
  const known = asPrismaLike(error)

  return known?.code === PRISMA_ERROR.UNIQUE_CONSTRAINT
}

export function isBookingOverlapRace(error: unknown): boolean {
  const known = asPrismaLike(error)

  if (!known || known.code !== PRISMA_ERROR.CONSTRAINT_FAILED) {
    return false
  }

  return constraintMentionsOverlap(known)
}

export function isBookingRaceConstraint(error: unknown): boolean {
  return isBookingUniqueRace(error) || isBookingOverlapRace(error)
}
