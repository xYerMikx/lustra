export function formatClientRatingLabel(
  ratingAvg: number,
  ratingCount: number,
): string {
  if (ratingCount === 0) {
    return 'пока нет оценок'
  }

  return `${ratingAvg.toFixed(1)} · ${ratingCount}`
}
