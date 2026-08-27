'use client'

import { useEffect } from 'react'
import type { PortfolioItemView } from '@lustra/contracts'

import { clampCarouselIndex } from '@/features/master-portfolio/model/carousel-index-from-scroll'
import { PortfolioCarousel } from '@/features/master-portfolio/ui/portfolio-carousel'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { CloseIcon } from '@/shared/ui/close-icon'
import { TEST_ID } from '@/shared/lib/test-id'

type PortfolioLightboxProps = {
  items: PortfolioItemView[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

export function PortfolioLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: PortfolioLightboxProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()

        return
      }

      if (event.key === 'ArrowRight') {
        onIndexChange(clampCarouselIndex(index + 1, items.length))

        return
      }

      if (event.key === 'ArrowLeft') {
        onIndexChange(clampCarouselIndex(index - 1, items.length))
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [index, items.length, onClose, onIndexChange])

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фото"
      data-testid={TEST_ID.portfolioLightbox}
      onClick={onClose}
    >
      <div
        className={styles.lightboxFrame}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.lightboxClose}
          aria-label="Закрыть"
          data-testid={TEST_ID.portfolioLightboxClose}
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <PortfolioCarousel
          items={items}
          index={index}
          onIndexChange={onIndexChange}
          variant="lightbox"
        />
      </div>
    </div>
  )
}
