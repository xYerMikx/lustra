export function averageStarRating(
  ratings: Array<number | null | undefined>,
): { avg: number; count: number } {
  let total = 0
  let count = 0

  for (const rating of ratings) {
    if (rating == null) {
      continue
    }

    total += rating
    count += 1
  }

  if (count === 0) {
    return { avg: 0, count: 0 }
  }

  return {
    avg: Math.round((total / count) * 10) / 10,
    count,
  }
}
