import { describe, expect, it } from 'vitest'

import { cycleTabIndex } from '@/shared/ui/dialog/cycle-tab-index'

describe('cycleTabIndex', () => {
  it('wraps forward from the last item to the first', () => {
    expect(cycleTabIndex(2, 3, 1)).toBe(0)
  })

  it('wraps backward from the first item to the last', () => {
    expect(cycleTabIndex(0, 3, -1)).toBe(2)
  })

  it('starts at the first item when focus is outside and Tab is pressed', () => {
    expect(cycleTabIndex(-1, 4, 1)).toBe(0)
  })

  it('starts at the last item when focus is outside and Shift+Tab is pressed', () => {
    expect(cycleTabIndex(-1, 4, -1)).toBe(3)
  })
})
