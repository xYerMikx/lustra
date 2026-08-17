import type { MeResponse } from '@lustra/contracts'

import { getMe } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'

let sessionInFlight: Promise<MeResponse | null> | null = null

/**
 * Single in-flight /auth/me for the tab (header + RequireSession + Strict Mode).
 * Cleared on logout / login so the next call hits the API again.
 */
export function loadSession(options?: { force?: boolean }): Promise<MeResponse | null> {
  if (options?.force) {
    sessionInFlight = null
  }

  if (!sessionInFlight) {
    sessionInFlight = getMe()
      .then((me) => me ?? null)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          return null
        }

        sessionInFlight = null

        return null
      })
  }

  return sessionInFlight
}

export function clearSessionCache(): void {
  sessionInFlight = null
}
