import { describe, expect, it } from 'vitest'

import { toExceptionInput } from '@/features/master-calendar/model/to-exception-input'

describe('toExceptionInput', () => {
  it('maps a day off without hours', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        untilDate: '',
        type: 'day_off',
        startTime: '10:00',
        endTime: '14:00',
        extraWindows: [],
        granularityMin: '',
        note: '  отпуск  ',
      }),
    ).toEqual({ type: 'day_off', note: 'отпуск' })
  })

  it('maps custom hours from HH:MM', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        untilDate: '',
        type: 'custom_hours',
        startTime: '10:00',
        endTime: '14:00',
        extraWindows: [],
        granularityMin: '',
        note: '',
      }),
    ).toMatchObject({
      type: 'custom_hours',
      intervals: [{ startMin: 600, endMin: 840 }],
    })
  })

  it('maps a period, extra windows and day step', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        untilDate: '2026-08-17',
        type: 'custom_hours',
        startTime: '10:00',
        endTime: '12:00',
        extraWindows: [{ startTime: '14:00', endTime: '15:00' }],
        granularityMin: '60',
        note: '',
      }),
    ).toMatchObject({
      type: 'custom_hours',
      untilDate: '2026-08-17',
      granularityMin: 60,
      intervals: [
        { startMin: 600, endMin: 720 },
        { startMin: 840, endMin: 900 },
      ],
    })
  })

  it('rejects inverted custom hours', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        untilDate: '',
        type: 'custom_hours',
        startTime: '14:00',
        endTime: '10:00',
        extraWindows: [],
        granularityMin: '',
        note: '',
      }),
    ).toBeNull()
  })
})
