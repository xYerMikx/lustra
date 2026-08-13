'use client'

import cn from 'classnames'
import type { PortfolioItemView } from '@lustra/contracts'

import { portfolioRatioClass } from '@/features/master-portfolio/model/portfolio-ratio-class'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'

type PortfolioGalleryGridProps = {
  items: PortfolioItemView[]
  onOpen: (index: number) => void
}

export function PortfolioGalleryGrid({
  items,
  onOpen,
}: PortfolioGalleryGridProps) {
  return (
    <ul className={styles.publicGrid}>
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            type="button"
            className={cn(
              styles.shotButton,
              styles.shot,
              styles[portfolioRatioClass(item.width, item.height)],
            )}
            onClick={() => onOpen(index)}
          >
            <img
              className={styles.image}
              src={item.url}
              alt={item.caption ?? 'Фото работы'}
              width={item.width}
              height={item.height}
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
