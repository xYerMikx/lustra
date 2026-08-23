export type ConfirmPanelBox = {
  top: number
  left: number
}

export function placeConfirmPanel(
  trigger: { top: number; right: number; bottom: number },
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  gap: number,
): ConfirmPanelBox {
  const spaceAbove = trigger.top - gap
  const preferAbove = spaceAbove >= panel.height
  const top = preferAbove
    ? trigger.top - panel.height - gap
    : trigger.bottom + gap
  const maxLeft = Math.max(gap, viewport.width - panel.width - gap)
  const left = Math.min(Math.max(gap, trigger.right - panel.width), maxLeft)
  const maxTop = Math.max(gap, viewport.height - panel.height - gap)

  return {
    top: Math.min(Math.max(gap, top), maxTop),
    left,
  }
}
