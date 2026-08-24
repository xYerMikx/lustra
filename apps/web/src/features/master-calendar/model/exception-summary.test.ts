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
        granularityMin: null,
        intervals: null,
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
        granularityMin: null,
        intervals: null,
        note: null,
      }),
    ).toBe('Особые часы 10:00–15:00')
  })

  it('lists custom windows and step', () => {
    expect(
      exceptionSummary({
        id: 'e1',
        date: '2026-08-15',
        type: 'custom_hours',
        startMin: 600,
        endMin: 1200,
        granularityMin: 60,
        intervals: [
          { startMin: 600, endMin: 720 },
          { startMin: 840, endMin: 900 },
        ],
        note: null,
      }),
    ).toBe('Особые часы 10:00–12:00, 14:00–15:00 · шаг 60 мин')
  })
})
