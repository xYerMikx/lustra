import { describe, expect, it } from 'vitest'

import { pickCoverItem } from '@/features/master-portfolio/model/pick-cover-item'

describe('pickCoverItem', () => {
  it('prefers the cover flag and falls back to the first item', () => {
    expect(
      pickCoverItem([
        { id: 'a', isCover: false },
        { id: 'b', isCover: true },
      ])?.id,
    ).toBe('b')
    expect(pickCoverItem([{ id: 'a', isCover: false }])?.id).toBe('a')
    expect(pickCoverItem([])).toBeNull()
  })
})
