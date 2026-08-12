import { describe, expect, it } from 'vitest'

import { resolveConfirmFromHold } from '@/modules/bookings/domain/booking-status.machine'

describe('resolveConfirmFromHold', () => {
  const now = new Date('2026-08-12T12:00:00.000Z')

  it('moves hold to pending when autoConfirm is off', () => {
    expect(
      resolveConfirmFromHold({
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        now,
        autoConfirm: false,
      }),
    ).toEqual({ ok: true, toStatus: 'pending' })
  })

  it('moves hold to confirmed when autoConfirm is on', () => {
    expect(
      resolveConfirmFromHold({
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        now,
        autoConfirm: true,
      }),
    ).toEqual({ ok: true, toStatus: 'confirmed' })
  })

  it('rejects expired and non-hold statuses', () => {
    expect(
      resolveConfirmFromHold({
        status: 'hold',
        holdExpiresAt: new Date('2026-08-12T11:59:00.000Z'),
        now,
        autoConfirm: true,
      }),
    ).toEqual({ ok: false, reason: 'expired' })

    expect(
      resolveConfirmFromHold({
        status: 'pending',
        holdExpiresAt: null,
        now,
        autoConfirm: true,
      }),
    ).toEqual({ ok: false, reason: 'not_hold' })
  })
})
