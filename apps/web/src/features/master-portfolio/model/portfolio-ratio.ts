export type PortfolioRatio = 'portrait' | 'landscape' | 'square'

export function portfolioRatio(width: number, height: number): PortfolioRatio {
  const ratio = width / height

  if (ratio >= 1.15) {
    return 'landscape'
  }

  if (ratio <= 0.85) {
    return 'portrait'
  }

  return 'square'
}
