export function cycleTabIndex(
  currentIndex: number,
  length: number,
  direction: 1 | -1,
): number {
  if (length <= 0) {
    return 0
  }

  if (currentIndex < 0) {
    return direction === 1 ? 0 : length - 1
  }

  return (currentIndex + direction + length) % length
}
