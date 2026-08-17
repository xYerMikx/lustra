import { portfolioRatio } from '@/features/master-portfolio/model/portfolio-ratio'

export function portfolioRatioClass(
  width: number,
  height: number,
): 'ratioPortrait' | 'ratioLandscape' | 'ratioSquare' {
  const ratio = portfolioRatio(width, height)

  if (ratio === 'portrait') {
    return 'ratioPortrait'
  }

  if (ratio === 'landscape') {
    return 'ratioLandscape'
  }

  return 'ratioSquare'
}
