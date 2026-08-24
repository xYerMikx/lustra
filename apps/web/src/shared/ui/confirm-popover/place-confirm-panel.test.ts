import { describe, expect, it } from 'vitest'

import { placeConfirmPanel } from '@/shared/ui/confirm-popover/place-confirm-panel'

describe('placeConfirmPanel', () => {
  const panel = { width: 240, height: 96 }
  const viewport = { width: 800, height: 600 }

  it('opens above the trigger when there is room', () => {
    const box = placeConfirmPanel(
      { top: 200, right: 400, bottom: 244 },
      panel,
      viewport,
      8,
    )

    expect(box.top).toBe(96)
    expect(box.left).toBe(160)
  })

  it('opens below when the trigger is near the top', () => {
    const box = placeConfirmPanel(
      { top: 20, right: 400, bottom: 64 },
      panel,
      viewport,
      8,
    )

    expect(box.top).toBe(72)
  })

  it('keeps the panel inside the viewport horizontally', () => {
    const box = placeConfirmPanel(
      { top: 200, right: 40, bottom: 244 },
      panel,
      viewport,
      8,
    )

    expect(box.left).toBe(8)
  })
})
