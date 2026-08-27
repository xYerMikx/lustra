export const PORTFOLIO_SSR_COUNT = 5

const TABLET_MIN_WIDTH = 768
const DESKTOP_MIN_WIDTH = 1024

export function portfolioFeedPageSize(viewportWidth: number): number {
  if (viewportWidth >= DESKTOP_MIN_WIDTH) {
    return 6
  }

  if (viewportWidth >= TABLET_MIN_WIDTH) {
    return 4
  }

  return 2
}

export function initialPortfolioVisibleCount(total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.min(PORTFOLIO_SSR_COUNT, total)
}

export function nextPortfolioVisibleCount(
  visibleCount: number,
  pageSize: number,
  total: number,
): number {
  if (total <= 0) {
    return 0
  }

  if (visibleCount >= total) {
    return total
  }

  const step = Math.max(1, pageSize)

  return Math.min(total, visibleCount + step)
}
