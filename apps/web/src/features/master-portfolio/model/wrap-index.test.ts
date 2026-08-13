import { describe, expect, it } from 'vitest'

import { wrapIndex } from '@/features/master-portfolio/model/wrap-index'

describe('wrapIndex', () => {
  it('wraps past the last item and before the first', () => {
    expect(wrapIndex(3, 3)).toBe(0)
    expect(wrapIndex(-1, 3)).toBe(2)
    expect(wrapIndex(1, 3)).toBe(1)
  })

  it('returns 0 for an empty list', () => {
    expect(wrapIndex(2, 0)).toBe(0)
  })
})
