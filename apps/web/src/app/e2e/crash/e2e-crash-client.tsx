'use client'

import { ApiError } from '@/shared/api/http'

export const E2E_CRASH_TRACE_ID = 'e2e-trace-afb65fbeb305b436'

export function E2eCrashClient() {
  if (typeof window === 'undefined') {
    return null
  }

  throw new ApiError(500, {
    code: 'INTERNAL',
    message: 'e2e crash',
    requestId: E2E_CRASH_TRACE_ID,
  })
}
