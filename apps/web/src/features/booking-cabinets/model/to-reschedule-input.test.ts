import { describe, expect, it } from 'vitest'

import {
  buildRescheduleFormDefaults,
  toRescheduleInput,
} from '@/features/booking-cabinets/model/to-reschedule-input'

describe('buildRescheduleFormDefaults', () => {
  it('splits the current visit into Minsk date and time', () => {
    expect(buildRescheduleFormDefaults('2026-08-20T10:00:00.000Z')).toEqual({
      date: '2026-08-20',
      startTime: '13:00',
      reason: '',
    })
  })
})

describe('toRescheduleInput', () => {
  it('maps local fields to the API payload', () => {
    expect(
      toRescheduleInput({
        date: '2026-08-20',
        startTime: '13:00',
        reason: ' клиент попросил ',
      }),
    ).toEqual({
      startsAt: '2026-08-20T10:00:00.000Z',
      reason: 'клиент попросил',
    })
  })

  it('rejects an empty reason', () => {
    expect(
      toRescheduleInput({
        date: '2026-08-20',
        startTime: '13:00',
        reason: '  ',
      }),
    ).toBeNull()
  })
})
