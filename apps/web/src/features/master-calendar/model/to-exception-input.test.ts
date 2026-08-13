import { describe, expect, it } from 'vitest'

import { toExceptionInput } from '@/features/master-calendar/model/to-exception-input'

describe('toExceptionInput', () => {
  it('maps a day off without hours', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        type: 'day_off',
        startTime: '10:00',
        endTime: '14:00',
        note: '  отпуск  ',
      }),
    ).toEqual({ type: 'day_off', note: 'отпуск' })
  })

  it('maps custom hours from HH:MM', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        type: 'custom_hours',
        startTime: '10:00',
        endTime: '14:00',
        note: '',
      }),
    ).toEqual({ type: 'custom_hours', startMin: 600, endMin: 840 })
  })

  it('rejects inverted custom hours', () => {
    expect(
      toExceptionInput({
        date: '2026-08-15',
        type: 'custom_hours',
        startTime: '14:00',
        endTime: '10:00',
        note: '',
      }),
    ).toBeNull()
  })
})
