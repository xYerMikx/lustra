'use client'

import { useEffect, useRef } from 'react'
import type { PortfolioItemView } from '@lustra/contracts'

import { swipeDirection } from '@/features/master-portfolio/model/swipe-direction'
import { wrapIndex } from '@/features/master-portfolio/model/wrap-index'
import styles from '@/features/master-portfolio/ui/master-portfolio.module.css'
import { Button } from '@/shared/ui/button'
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
  const startXRef = useRef<number | null>(null)
  const didSwipeRef = useRef(false)
  const item = items[index]

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()

        return
      }

      if (event.key === 'ArrowRight') {
        onIndexChange(wrapIndex(index + 1, items.length))

        return
      }

      if (event.key === 'ArrowLeft') {
        onIndexChange(wrapIndex(index - 1, items.length))
      }
    }

    window.addEventListener('keydown', handleKey)

    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [index, items.length, onClose, onIndexChange])

  if (!item) {
    return null
  }

  const closeUnlessSwiped = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false

      return
    }

    onClose()
  }

  const handlePointerUp = (clientX: number) => {
    const startX = startXRef.current
    startXRef.current = null

    if (startX == null) {
      return
    }

    const direction = swipeDirection(startX, clientX)

    if (!direction) {
      return
    }

    didSwipeRef.current = true

    if (direction === 'next') {
      onIndexChange(wrapIndex(index + 1, items.length))

      return
    }

    onIndexChange(wrapIndex(index - 1, items.length))
  }

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фото"
      data-testid={TEST_ID.portfolioLightbox}
      onClick={closeUnlessSwiped}
      onTouchStart={(event) => {
        startXRef.current = event.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        handlePointerUp(event.changedTouches[0]?.clientX ?? 0)
      }}
    >
      <div
        className={styles.lightboxFrame}
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className={styles.lightboxImage}
          src={item.url}
          alt={item.caption ?? 'Фото работы'}
        />
        {item.caption ? (
          <p className={styles.lightboxCaption}>{item.caption}</p>
        ) : null}
        <div className={styles.lightboxNav}>
          {items.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.lightboxGhost}
              onClick={() => onIndexChange(wrapIndex(index - 1, items.length))}
            >
              Назад
            </Button>
          ) : null}
          <Button type="button" onClick={onClose} data-testid={TEST_ID.portfolioLightboxClose}>
            Закрыть
          </Button>
          {items.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              className={styles.lightboxGhost}
              onClick={() => onIndexChange(wrapIndex(index + 1, items.length))}
            >
              Дальше
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
