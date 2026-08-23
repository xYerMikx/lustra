import { describe, expect, it } from 'vitest'

import { parseScheduleIntervals } from '@/modules/scheduling/domain/parse-schedule-intervals'

describe('parseScheduleIntervals', () => {
  it('reads valid windows and skips junk', () => {
    expect(
      parseScheduleIntervals([
        { startMin: 840, endMin: 900 },
        { startMin: 600, endMin: 720 },
        { startMin: 10 },
      ]),
    ).toEqual([
      { startMin: 600, endMin: 720 },
      { startMin: 840, endMin: 900 },
    ])
  })

  it('returns null for empty or invalid payload', () => {
    expect(parseScheduleIntervals(null)).toBeNull()
    expect(parseScheduleIntervals([])).toBeNull()
    expect(parseScheduleIntervals('nope')).toBeNull()
  })
})
