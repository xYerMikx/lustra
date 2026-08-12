import { describe, expect, it } from 'vitest'

import {
  formatHoldCountdown,
  remainingHoldMs,
} from '@/features/slot-picker/model/hold-timer'

describe('hold-timer', () => {
  it('computes remaining ms clamped at zero', () => {
    expect(
      remainingHoldMs('2026-08-12T12:10:00.000Z', Date.parse('2026-08-12T12:00:00.000Z')),
    ).toBe(600_000)

    expect(
      remainingHoldMs('2026-08-12T11:59:00.000Z', Date.parse('2026-08-12T12:00:00.000Z')),
    ).toBe(0)
  })

  it('formats mm:ss countdown', () => {
    expect(formatHoldCountdown(125_000)).toBe('02:05')
    expect(formatHoldCountdown(0)).toBe('00:00')
  })
})
