export function visibleWeekRange(
  dates: string[],
  scrollLeft: number,
  cardStride: number,
  visibleCount: number,
): { from: string; to: string } | null {
  if (dates.length === 0 || cardStride <= 0) {
    return null
  }

  const maxStart = Math.max(0, dates.length - 1)
  const startIndex = Math.min(
    maxStart,
    Math.max(0, Math.round(scrollLeft / cardStride)),
  )
  const endIndex = Math.min(
    dates.length - 1,
    startIndex + Math.max(1, visibleCount) - 1,
  )
  const from = dates[startIndex]
  const to = dates[endIndex]

  if (!from || !to) {
    return null
  }

  return { from, to }
}

export function weekCardStride(cardWidth: number, gap: number): number {
  return cardWidth + gap
}

/** First card index of the carousel page that contains `ymdDate`. */
export function carouselPageStartIndex(
  dates: string[],
  ymdDate: string,
  visibleCount: number,
): number {
  const index = dates.indexOf(ymdDate)

  if (index < 0) {
    return 0
  }

  const size = Math.max(1, visibleCount)

  return Math.floor(index / size) * size
}

export function scrollLeftForChild(
  scrollLeft: number,
  viewportLeft: number,
  childLeft: number,
): number {
  return Math.max(0, Math.round(scrollLeft + (childLeft - viewportLeft)))
}
