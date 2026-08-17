import { describe, expect, it } from 'vitest'

import {
  PutScheduleExceptionInputSchema,
  YmdDateSchema,
} from './master-schedule'

describe('YmdDateSchema', () => {
  it('accepts a calendar date', () => {
    expect(YmdDateSchema.parse('2026-08-15')).toBe('2026-08-15')
  })

  it('rejects non-ISO dates', () => {
    expect(YmdDateSchema.safeParse('15.08.2026').success).toBe(false)
  })
})

describe('PutScheduleExceptionInputSchema', () => {
  it('accepts a day off without hours', () => {
    expect(
      PutScheduleExceptionInputSchema.parse({
        type: 'day_off',
        note: 'отпуск',
      }),
    ).toEqual({ type: 'day_off', note: 'отпуск' })
  })

  it('requires a valid interval for custom hours', () => {
    expect(
      PutScheduleExceptionInputSchema.safeParse({ type: 'custom_hours' })
        .success,
    ).toBe(false)

    expect(
      PutScheduleExceptionInputSchema.safeParse({
        type: 'custom_hours',
        startMin: 600,
        endMin: 600,
      }).success,
    ).toBe(false)

    expect(
      PutScheduleExceptionInputSchema.parse({
        type: 'custom_hours',
        startMin: 600,
        endMin: 900,
      }),
    ).toEqual({
      type: 'custom_hours',
      startMin: 600,
      endMin: 900,
    })
  })
})
