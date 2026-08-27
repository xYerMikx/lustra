import type { PortfolioItemView } from '@lustra/contracts'

import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { publicPortfolioShotTestId } from '@/shared/lib/test-id'

type PortfolioCarouselSlideProps = {
  item: PortfolioItemView
  active: boolean
  eager: boolean
  onOpen?: () => void
}

export function PortfolioCarouselSlide({
  item,
  active,
  eager,
  onOpen,
}: PortfolioCarouselSlideProps) {
  const alt = item.caption ?? 'Фото работы'
  const image = (
    <img
      className={styles.carouselImage}
      src={item.url}
      alt={alt}
      width={item.width}
      height={item.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'low'}
      draggable={false}
    />
  )

  const current = active ? 'true' : undefined

  const testId = publicPortfolioShotTestId(item.id)

  if (!onOpen) {
    return (
      <li className={styles.slide} aria-current={current} data-testid={testId}>
        {image}
      </li>
    )
  }

  return (
    <li className={styles.slide} aria-current={current} data-testid={testId}>
      <button
        type="button"
        className={styles.slideButton}
        aria-current={current}
        onClick={onOpen}
      >
        {image}
      </button>
    </li>
  )
}
