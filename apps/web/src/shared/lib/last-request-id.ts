const STORAGE_KEY = 'lustra:last-request-id'

let memoryRequestId: string | undefined

function canUseSessionStorage(): boolean {
  return typeof sessionStorage !== 'undefined'
}

export function rememberRequestId(requestId: string | undefined): void {
  if (!requestId) {
    return
  }

  memoryRequestId = requestId

  if (!canUseSessionStorage()) {
    return
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, requestId)
  } catch {
    // private mode / quota
  }
}

export function readLastRequestId(): string | undefined {
  if (memoryRequestId) {
    return memoryRequestId
  }

  if (!canUseSessionStorage()) {
    return undefined
  }

  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? undefined
  } catch {
    return undefined
  }
}

export function clearLastRequestId(): void {
  memoryRequestId = undefined

  if (!canUseSessionStorage()) {
    return
  }

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // private mode / quota
  }
}
