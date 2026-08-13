export function missingGranuleStarts(
  startsAt: Date,
  coverageEnd: Date,
  granularityMin: number,
  existingStarts: Date[],
): Date[] {
  const stepMs = granularityMin * 60_000
  const existing = new Set(existingStarts.map((value) => value.getTime()))
  const missing: Date[] = []

  for (
    let cursor = startsAt.getTime();
    cursor < coverageEnd.getTime();
    cursor += stepMs
  ) {
    if (!existing.has(cursor)) {
      missing.push(new Date(cursor))
    }
  }

  return missing
}
