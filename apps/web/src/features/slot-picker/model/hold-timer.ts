export function remainingHoldMs(
  holdExpiresAt: string,
  nowMs: number = Date.now(),
): number {
  const expiresMs = new Date(holdExpiresAt).getTime()

  if (!Number.isFinite(expiresMs)) {
    return 0
  }

  return Math.max(0, expiresMs - nowMs)
}

export function formatHoldCountdown(remainingMs: number): string {
  const totalSec = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
