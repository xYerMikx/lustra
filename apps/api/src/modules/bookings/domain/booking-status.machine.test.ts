import { describe, expect, it } from 'vitest'

import {
  resolveClientCancel,
  resolveConfirmFromHold,
  resolveMasterCancel,
  resolveMasterComplete,
  resolveMasterConfirmPending,
  resolveMasterReschedule,
} from '@/modules/bookings/domain/booking-status.machine'

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

describe('resolveClientCancel', () => {
  const now = new Date('2026-08-12T12:00:00.000Z')

  it('allows cancel before cutoff', () => {
    expect(
      resolveClientCancel({
        status: 'confirmed',
        startsAt: new Date('2026-08-13T12:00:00.000Z'),
        now,
        clientCancelCutoffMin: 720,
      }),
    ).toEqual({ ok: true, toStatus: 'cancelled_by_client' })
  })

  it('blocks cancel after cutoff', () => {
    expect(
      resolveClientCancel({
        status: 'confirmed',
        startsAt: new Date('2026-08-12T18:00:00.000Z'),
        now,
        clientCancelCutoffMin: 720,
      }),
    ).toEqual({ ok: false, reason: 'cutoff_passed' })
  })

  it('rejects terminal statuses', () => {
    expect(
      resolveClientCancel({
        status: 'completed',
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        now,
        clientCancelCutoffMin: 720,
      }),
    ).toEqual({ ok: false, reason: 'invalid_state' })
  })
})

describe('resolveMasterCancel', () => {
  it('cancels active bookings', () => {
    expect(resolveMasterCancel({ status: 'pending' })).toEqual({
      ok: true,
      toStatus: 'cancelled_by_master',
    })
  })
})

describe('resolveMasterComplete', () => {
  const now = new Date('2026-08-12T12:00:00.000Z')

  it('completes a confirmed visit that has started', () => {
    expect(
      resolveMasterComplete({
        status: 'confirmed',
        startsAt: new Date('2026-08-12T10:00:00.000Z'),
        now,
      }),
    ).toEqual({ ok: true })
  })

  it('rejects a future confirmed booking', () => {
    expect(
      resolveMasterComplete({
        status: 'confirmed',
        startsAt: new Date('2026-08-20T10:00:00.000Z'),
        now,
      }),
    ).toEqual({ ok: false, reason: 'visit_not_started' })
  })

  it('rejects non-confirmed statuses', () => {
    expect(
      resolveMasterComplete({
        status: 'pending',
        startsAt: new Date('2026-08-12T10:00:00.000Z'),
        now,
      }),
    ).toEqual({ ok: false, reason: 'not_confirmed' })
  })
})

describe('resolveMasterReschedule', () => {
  it('allows pending and confirmed to move to a new time', () => {
    expect(
      resolveMasterReschedule({
        status: 'confirmed',
        currentStartsAt: new Date('2026-08-20T10:00:00.000Z'),
        nextStartsAt: new Date('2026-08-21T10:00:00.000Z'),
      }),
    ).toEqual({ ok: true })
  })

  it('rejects the same instant and terminal statuses', () => {
    expect(
      resolveMasterReschedule({
        status: 'confirmed',
        currentStartsAt: new Date('2026-08-20T10:00:00.000Z'),
        nextStartsAt: new Date('2026-08-20T10:00:00.000Z'),
      }),
    ).toEqual({ ok: false, reason: 'same_time' })

    expect(
      resolveMasterReschedule({
        status: 'hold',
        currentStartsAt: new Date('2026-08-20T10:00:00.000Z'),
        nextStartsAt: new Date('2026-08-21T10:00:00.000Z'),
      }),
    ).toEqual({ ok: false, reason: 'invalid_state' })
  })
})

describe('resolveMasterConfirmPending', () => {
  it('only confirms pending', () => {
    expect(resolveMasterConfirmPending({ status: 'pending' })).toEqual({
      ok: true,
    })

    expect(resolveMasterConfirmPending({ status: 'hold' })).toEqual({
      ok: false,
      reason: 'not_pending',
    })
  })
})
