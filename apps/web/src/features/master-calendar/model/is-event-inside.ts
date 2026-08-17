export function isEventInside(
  root: Pick<HTMLElement, 'contains'> | null,
  target: EventTarget | null,
): boolean {
  if (!root || target == null) {
    return false
  }

  return root.contains(target as Node)
}
