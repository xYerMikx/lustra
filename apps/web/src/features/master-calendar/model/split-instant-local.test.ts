import { describe, expect, it } from 'vitest'

import { splitInstantLocal } from '@/features/master-calendar/model/split-instant-local'

describe('splitInstantLocal', () => {
  it('splits a UTC instant into Minsk date and time', () => {
    expect(splitInstantLocal(new Date('2026-08-20T10:00:00.000Z'))).toEqual({
      date: '2026-08-20',
      time: '13:00',
    })
  })
})
