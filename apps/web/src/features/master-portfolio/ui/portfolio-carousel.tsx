'use client'

import type { PortfolioItemView } from '@lustra/contracts'
import cn from 'classnames'

import { usePortfolioCarouselScroll } from '@/features/master-portfolio/model/use-portfolio-carousel-scroll'
import { PortfolioCarouselArrow } from '@/features/master-portfolio/ui/portfolio-carousel-arrow'
import { PortfolioCarouselSlide } from '@/features/master-portfolio/ui/portfolio-carousel-slide'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type PortfolioCarouselProps = {
  items: PortfolioItemView[]
  index: number
  onIndexChange: (index: number) => void
  onOpen?: (index: number) => void
  variant?: 'page' | 'lightbox'
}

export function PortfolioCarousel({
  items,
  index,
  onIndexChange,
  onOpen,
  variant = 'page',
}: PortfolioCarouselProps) {
  const active = items[index]
  const { trackRef, handleScroll, goTo, canGoPrev, canGoNext } =
    usePortfolioCarouselScroll({
      index,
      length: items.length,
      onIndexChange,
    })

  if (!active) {
    return null
  }

  const showArrows = items.length > 1
  const isLightbox = variant === 'lightbox'

  return (
    <div
      className={cn(styles.carousel, isLightbox && styles.carouselLightbox)}
      data-testid={TEST_ID.portfolioCarousel}
    >
      <div className={cn(styles.stage, isLightbox && styles.stageFill)}>
        <div className={cn(styles.viewport, isLightbox && styles.viewportLightbox)}>
          <ul ref={trackRef} className={styles.track} onScroll={handleScroll}>
            {items.map((item, itemIndex) => (
              <PortfolioCarouselSlide
                key={item.id}
                item={item}
                active={itemIndex === index}
                eager={Math.abs(itemIndex - index) <= 1}
                onOpen={onOpen ? () => onOpen(itemIndex) : undefined}
              />
            ))}
          </ul>
        </div>
        {showArrows ? (
          <PortfolioCarouselArrow
            direction="prev"
            testId={TEST_ID.portfolioCarouselPrev}
            disabled={!canGoPrev}
            onClick={() => goTo(-1)}
          />
        ) : null}
        {showArrows ? (
          <PortfolioCarouselArrow
            direction="next"
            testId={TEST_ID.portfolioCarouselNext}
            disabled={!canGoNext}
            onClick={() => goTo(1)}
          />
        ) : null}
      </div>
      {active.caption ? (
        <p
          className={cn(
            styles.carouselCaption,
            isLightbox && styles.carouselCaptionLightbox,
          )}
        >
          {active.caption}
        </p>
      ) : null}
      {showArrows ? (
        <p
          className={cn(
            styles.carouselCount,
            isLightbox && styles.carouselCaptionLightbox,
          )}
        >
          {index + 1} из {items.length}
        </p>
      ) : null}
    </div>
  )
}
