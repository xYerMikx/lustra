/** Prisma Client known request error codes we handle explicitly. */
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
} as const

export type PrismaErrorCode = (typeof PRISMA_ERROR)[keyof typeof PRISMA_ERROR]
