'use client'

import { useState } from 'react'
import type { PortfolioItemView } from '@lumira/contracts'

import { usePortfolioInfiniteFeed } from '@/features/master-portfolio/model/use-portfolio-infinite-feed'
import { PortfolioLightbox } from '@/features/master-portfolio/ui/portfolio-lightbox'
import { PublicPortfolioShot } from '@/features/master-portfolio/ui/public-portfolio-shot'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type PublicPortfolioFeedProps = {
  items: PortfolioItemView[]
}

export function PublicPortfolioFeed({ items }: PublicPortfolioFeedProps) {
  const { visibleCount, sentinelRef, hasMore } = usePortfolioInfiniteFeed(
    items.length,
  )
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const visibleItems = items.slice(0, visibleCount)

  return (
    <>
      <ul className={styles.publicGrid}>
        {visibleItems.map((item, itemIndex) => {
          const openShot = () => {
            setIndex(itemIndex)

            setLightboxOpen(true)
          }

          return (
            <PublicPortfolioShot
              key={item.id}
              item={item}
              eager={itemIndex === 0}
              onOpen={openShot}
            />
          )
        })}
      </ul>
      {hasMore ? (
        <div
          ref={sentinelRef}
          className={styles.sentinel}
          data-testid={TEST_ID.publicPortfolioSentinel}
        />
      ) : null}
      {lightboxOpen ? (
        <PortfolioLightbox
          items={items}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  )
}
