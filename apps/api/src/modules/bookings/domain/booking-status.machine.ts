import type { BookingStatus } from '@lustra/contracts'

export type ConfirmHoldResult =
  | { ok: true; toStatus: Extract<BookingStatus, 'pending' | 'confirmed'> }
  | { ok: false; reason: 'not_hold' | 'expired' }

export function resolveConfirmFromHold(input: {
  status: BookingStatus
  holdExpiresAt: Date | null
  now: Date
  autoConfirm: boolean
}): ConfirmHoldResult {
  if (input.status !== 'hold') {
    return { ok: false, reason: 'not_hold' }
  }

  if (!input.holdExpiresAt || input.holdExpiresAt.getTime() <= input.now.getTime()) {
    return { ok: false, reason: 'expired' }
  }

  return {
    ok: true,
    toStatus: input.autoConfirm ? 'confirmed' : 'pending',
  }
}
