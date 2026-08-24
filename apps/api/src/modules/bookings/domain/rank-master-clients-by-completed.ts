export type FrequentClientRank = {
  id: string
  name: string
  visitsCountColumn: number
  completedCount: number
  lastCompletedAt: string | null
}

export function compareByCompletedVisits(
  left: FrequentClientRank,
  right: FrequentClientRank,
): number {
  if (right.completedCount !== left.completedCount) {
    return right.completedCount - left.completedCount
  }

  const leftLast = left.lastCompletedAt ?? ''
  const rightLast = right.lastCompletedAt ?? ''

  if (rightLast !== leftLast) {
    if (rightLast > leftLast) {
      return 1
    }

    return -1
  }

  return left.name.localeCompare(right.name, 'ru')
}

export function rankByCompletedVisits(
  rows: FrequentClientRank[],
): FrequentClientRank[] {
  return [...rows].sort(compareByCompletedVisits)
}
