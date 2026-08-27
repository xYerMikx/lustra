'use client'

import { useState } from 'react'
import type { PortfolioItemView } from '@lustra/contracts'

import { PortfolioCarousel } from '@/features/master-portfolio/ui/portfolio-carousel'
import { PortfolioLightbox } from '@/features/master-portfolio/ui/portfolio-lightbox'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type PublicPortfolioGalleryProps = {
  items: PortfolioItemView[]
}

export function PublicPortfolioGallery({ items }: PublicPortfolioGalleryProps) {
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (items.length === 0) {
    return null
  }

  const safeIndex = index < items.length ? index : 0

  return (
    <section
      className={styles.publicSection}
      aria-label="Портфолио"
      data-testid={TEST_ID.publicPortfolioGallery}
    >
      <h2 className={styles.publicTitle}>Работы</h2>
      <PortfolioCarousel
        items={items}
        index={safeIndex}
        onIndexChange={setIndex}
        onOpen={(nextIndex) => {
          setIndex(nextIndex)

          setLightboxOpen(true)
        }}
      />
      {lightboxOpen ? (
        <PortfolioLightbox
          items={items}
          index={safeIndex}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </section>
  )
}
