import { createHash, randomBytes, randomUUID } from 'node:crypto'

/** SHA-256 hex digest of a refresh token (never store raw tokens). */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex')
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

export const generateAuthToken = generateRefreshToken

export function generateFamilyId(): string {
  return randomUUID()
}

export function generateCsrfToken(): string {
  return randomBytes(24).toString('base64url')
}
