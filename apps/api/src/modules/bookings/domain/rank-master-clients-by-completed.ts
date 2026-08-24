export type FrequentClientRank = {
  id: string
  name: string
  visitsCountColumn: number
  completedCount: number
  lastCompletedAt: string | null
}

export function compareByCompletedVisits(input: {
  current: FrequentClientRank
  other: FrequentClientRank
}): number {
  const { current, other } = input

  if (other.completedCount !== current.completedCount) {
    return other.completedCount - current.completedCount
  }

  const currentLast = current.lastCompletedAt ?? ''
  const otherLast = other.lastCompletedAt ?? ''

  if (otherLast !== currentLast) {
    if (otherLast > currentLast) {
      return 1
    }

    return -1
  }

  return current.name.localeCompare(other.name, 'ru')
}

export function rankByCompletedVisits(
  rows: FrequentClientRank[],
): FrequentClientRank[] {
  return [...rows].sort((current, other) =>
    compareByCompletedVisits({ current, other }),
  )
}
