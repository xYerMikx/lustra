import { useSyncExternalStore } from 'react'

import { readLastRequestId } from '@/shared/lib/last-request-id'

function subscribeRequestId() {
  return () => undefined
}

export function useLastRequestId(): string | undefined {
  return useSyncExternalStore(
    subscribeRequestId,
    readLastRequestId,
    () => undefined,
  )
}
