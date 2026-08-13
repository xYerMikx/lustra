import { describe, expect, it } from 'vitest'

import { isEventInside } from '@/features/master-calendar/model/is-event-inside'

describe('isEventInside', () => {
  it('is true when contains reports the target', () => {
    const child = {} as Node
    const root = {
      contains: (node: Node) => node === child,
    }

    expect(isEventInside(root, child as EventTarget)).toBe(true)
  })

  it('is false when the root is missing or does not contain the target', () => {
    const other = {} as EventTarget
    const root = {
      contains: () => false,
    }

    expect(isEventInside(root, other)).toBe(false)
    expect(isEventInside(null, other)).toBe(false)
  })
})
