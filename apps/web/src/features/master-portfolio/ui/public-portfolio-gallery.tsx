'use client'

import { useState } from 'react'
import type { PortfolioItemView } from '@lustra/contracts'

import { PortfolioGalleryGrid } from '@/features/master-portfolio/ui/portfolio-gallery-grid'
import { PortfolioLightbox } from '@/features/master-portfolio/ui/portfolio-lightbox'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type PublicPortfolioGalleryProps = {
  items: PortfolioItemView[]
}

export function PublicPortfolioGallery({ items }: PublicPortfolioGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return null
  }

  return (
    <section
      className={styles.publicSection}
      aria-label="Портфолио"
      data-testid={TEST_ID.publicPortfolioGallery}
    >
      <h2 className={styles.publicTitle}>Работы</h2>
      <PortfolioGalleryGrid items={items} onOpen={setActiveIndex} />
      {activeIndex === null ? null : (
        <PortfolioLightbox
          items={items}
          index={activeIndex}
          onIndexChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </section>
  )
}
