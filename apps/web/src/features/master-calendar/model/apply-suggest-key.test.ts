import { describe, expect, it } from 'vitest'

import { applySuggestKey } from '@/features/master-calendar/model/apply-suggest-key'

const base = {
  open: true,
  activeIndex: 1,
  matchCount: 3,
}

describe('applySuggestKey', () => {
  it('ignores keys when the list is closed', () => {
    expect(
      applySuggestKey({ ...base, open: false, key: 'ArrowDown' }),
    ).toEqual({
      preventDefault: false,
      open: false,
      activeIndex: 1,
      pick: false,
    })
  })

  it('moves the highlight with arrows', () => {
    expect(applySuggestKey({ ...base, key: 'ArrowDown' }).activeIndex).toBe(2)
    expect(applySuggestKey({ ...base, key: 'ArrowUp' }).activeIndex).toBe(0)
    expect(
      applySuggestKey({ ...base, activeIndex: 2, key: 'ArrowDown' }).activeIndex,
    ).toBe(2)
  })

  it('picks on Enter and closes on Escape', () => {
    expect(applySuggestKey({ ...base, key: 'Enter' })).toMatchObject({
      preventDefault: true,
      open: false,
      pick: true,
    })
    expect(applySuggestKey({ ...base, key: 'Escape' })).toMatchObject({
      preventDefault: true,
      open: false,
      pick: false,
    })
  })
})
