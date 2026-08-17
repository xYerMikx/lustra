export const BAYES_M = 5
export const BAYES_C = 4.5

export type RatingStar = 1 | 2 | 3 | 4 | 5

export type RatingHistogram = Record<RatingStar, number>

export type BayesianRating = {
  avg: number
  count: number
  histogram: RatingHistogram
}

export function emptyHistogram(): RatingHistogram {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}

export function isRatingStar(value: number): value is RatingStar {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

/**
 * Bayesian average: (Σratings + m·C) / (n + m).
 * With n=0 the catalog shows a new master, so avg stays 0.
 */
export function bayesianRating(ratings: number[]): BayesianRating {
  const histogram = emptyHistogram()

  for (const rating of ratings) {
    if (isRatingStar(rating)) {
      histogram[rating] += 1
    }
  }

  const counted =
    histogram[1] + histogram[2] + histogram[3] + histogram[4] + histogram[5]

  if (counted === 0) {
    return { avg: 0, count: 0, histogram }
  }

  let total = 0

  for (const star of [1, 2, 3, 4, 5] as const) {
    total += star * histogram[star]
  }

  const avg = (total + BAYES_M * BAYES_C) / (counted + BAYES_M)

  return {
    avg: roundRating(avg),
    count: counted,
    histogram,
  }
}

function roundRating(value: number): number {
  return Math.round(value * 100) / 100
}
