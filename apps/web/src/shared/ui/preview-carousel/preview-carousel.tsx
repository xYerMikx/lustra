'use client'

import { Children, type ReactNode, useState } from 'react'
import cn from 'classnames'

import { ChevronDownIcon } from '@/shared/ui/icon-pack'
import { usePreviewCarousel } from '@/shared/ui/preview-carousel/use-preview-carousel'
import type { PreviewCarouselItem } from '@/shared/ui/preview-carousel/preview-carousel-item'
import styles from '@/shared/ui/preview-carousel/preview-carousel.module.css'

type PreviewCarouselProps = {
  label: string
  items: readonly PreviewCarouselItem[]
  children: ReactNode
}

export function PreviewCarousel({
  label,
  items,
  children,
}: PreviewCarouselProps) {
  const [paused, setPaused] = useState(false)
  const { index, setIndex } = usePreviewCarousel({
    total: items.length,
    paused,
  })
  const current = items[index]

  return (
    <div
      className={styles.carousel}
      role="region"
      aria-roledescription="карусель"
      aria-label={label}
      onMouseEnter={() => {
        setPaused(true)
      }}
      onMouseLeave={() => {
        setPaused(false)
      }}
    >
      <div className={styles.phone}>
        <div className={styles.viewport}>
          <div className={styles.track} data-index={String(index)}>
            {Children.map(children, (child) => (
              <div className={styles.slide}>{child}</div>
            ))}
          </div>
        </div>
        <div className={styles.fade} aria-hidden="true" />
        <div className={styles.hint} aria-hidden="true">
          <ChevronDownIcon className={styles.hintIcon} />
        </div>
        <div className={styles.dots}>
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={styles.dot}
              aria-label={item.label}
              aria-current={itemIndex === index ? 'true' : undefined}
              onClick={() => {
                setIndex(itemIndex)
              }}
            >
              <span
                className={cn(
                  styles.pip,
                  itemIndex === index && styles.pipCurrent,
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <p className={styles.caption}>{current?.caption ?? ''}</p>
    </div>
  )
}
