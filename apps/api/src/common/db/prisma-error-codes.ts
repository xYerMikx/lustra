/** Prisma Client known request error codes we handle explicitly. */
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  /** Failed DB constraint (CHECK / EXCLUDE / …). */
  CONSTRAINT_FAILED: 'P2004',
} as const

export type PrismaErrorCode = (typeof PRISMA_ERROR)[keyof typeof PRISMA_ERROR]

export const TIME_BLOCK_NO_OVERLAP = 'block_no_overlap'
