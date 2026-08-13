export type SwipeDirection = 'prev' | 'next'

export function swipeDirection(
  startX: number,
  endX: number,
  threshold = 40,
): SwipeDirection | null {
  const delta = endX - startX

  if (Math.abs(delta) < threshold) {
    return null
  }

  if (delta > 0) {
    return 'prev'
  }

  return 'next'
}
