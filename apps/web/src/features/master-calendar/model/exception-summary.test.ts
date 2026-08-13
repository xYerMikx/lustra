import { describe, expect, it } from 'vitest'

import { exceptionSummary } from '@/features/master-calendar/model/exception-summary'

describe('exceptionSummary', () => {
  it('labels a day off', () => {
    expect(
      exceptionSummary({
        id: 'e1',
        date: '2026-08-15',
        type: 'day_off',
        startMin: null,
        endMin: null,
        note: null,
      }),
    ).toBe('Выходной')
  })

  it('includes custom hours', () => {
    expect(
      exceptionSummary({
        id: 'e1',
        date: '2026-08-15',
        type: 'custom_hours',
        startMin: 600,
        endMin: 900,
        note: null,
      }),
    ).toBe('Особые часы 10:00–15:00')
  })
})
