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

const CANCELABLE: BookingStatus[] = ['hold', 'pending', 'confirmed']

export type CancelDecision =
  | {
      ok: true
      toStatus: Extract<BookingStatus, 'cancelled_by_client' | 'cancelled_by_master'>
    }
  | { ok: false; reason: 'invalid_state' | 'cutoff_passed' }

export function resolveClientCancel(input: {
  status: BookingStatus
  startsAt: Date
  now: Date
  clientCancelCutoffMin: number
}): CancelDecision {
  if (!CANCELABLE.includes(input.status)) {
    return { ok: false, reason: 'invalid_state' }
  }

  const cutoffMs = input.clientCancelCutoffMin * 60_000
  const latestCancelAt = input.startsAt.getTime() - cutoffMs

  if (input.now.getTime() > latestCancelAt) {
    return { ok: false, reason: 'cutoff_passed' }
  }

  return { ok: true, toStatus: 'cancelled_by_client' }
}

export function resolveMasterCancel(input: {
  status: BookingStatus
}): CancelDecision {
  if (!CANCELABLE.includes(input.status)) {
    return { ok: false, reason: 'invalid_state' }
  }

  return { ok: true, toStatus: 'cancelled_by_master' }
}

export type MasterConfirmPendingResult =
  | { ok: true }
  | { ok: false; reason: 'not_pending' }

export function resolveMasterConfirmPending(input: {
  status: BookingStatus
}): MasterConfirmPendingResult {
  if (input.status !== 'pending') {
    return { ok: false, reason: 'not_pending' }
  }

  return { ok: true }
}
