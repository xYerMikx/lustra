import { describe, expect, it } from 'vitest'

import {
  groupSlotsByPeriod,
  periodForHour,
} from '@/features/slot-picker/model/group-slots-by-period'

describe('groupSlotsByPeriod', () => {
  it('classifies hours into morning/day/evening', () => {
    expect(periodForHour(9)).toBe('morning')
    expect(periodForHour(13)).toBe('day')
    expect(periodForHour(19)).toBe('evening')
  })

  it('groups availability slots by local period', () => {
    const grouped = groupSlotsByPeriod(
      [
        {
          startsAt: '2026-08-12T07:00:00.000Z', // 10:00 Minsk
          endsAt: '2026-08-12T08:30:00.000Z',
          slotIds: ['a'],
        },
        {
          startsAt: '2026-08-12T11:00:00.000Z', // 14:00 Minsk
          endsAt: '2026-08-12T12:30:00.000Z',
          slotIds: ['b'],
        },
      ],
      'Europe/Minsk',
    )

    expect(grouped.map((item) => item.period)).toEqual(['morning', 'day'])
    expect(grouped[0]?.slots).toHaveLength(1)
  })
})
