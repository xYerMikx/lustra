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
