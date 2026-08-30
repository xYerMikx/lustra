import Image from 'next/image'
import type { PortfolioItemView } from '@lumira/contracts'

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
    <Image
      className={styles.carouselImage}
      src={item.url}
      alt={alt}
      fill
      sizes="100vw"
      quality={90}
      priority={eager}
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
