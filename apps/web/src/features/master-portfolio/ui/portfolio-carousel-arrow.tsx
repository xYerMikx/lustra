import cn from 'classnames'

import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/ui/icon-pack'

type PortfolioCarouselArrowProps = {
  direction: 'prev' | 'next'
  onClick: () => void
  testId: string
  disabled?: boolean
}

export function PortfolioCarouselArrow({
  direction,
  onClick,
  testId,
  disabled = false,
}: PortfolioCarouselArrowProps) {
  const isPrev = direction === 'prev'
  const label = isPrev ? 'Предыдущее фото' : 'Следующее фото'

  return (
    <button
      type="button"
      className={cn(styles.arrow, isPrev ? styles.arrowPrev : styles.arrowNext)}
      aria-label={label}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
    >
      {isPrev ? (
        <ChevronLeftIcon className={styles.arrowIcon} />
      ) : (
        <ChevronRightIcon className={styles.arrowIcon} />
      )}
    </button>
  )
}
