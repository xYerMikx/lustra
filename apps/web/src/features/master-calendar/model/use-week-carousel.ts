'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  visibleWeekRange,
  weekCardStride,
} from '@/features/master-calendar/model/visible-week-range'

export function useWeekCarousel(dates: string[]) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const datesRef = useRef(dates)
  const [visibleCount, setVisibleCount] = useState(1)
  const [visibleRange, setVisibleRange] = useState<{
    from: string
    to: string
  } | null>(null)
  const datesKey = dates.join(',')

  datesRef.current = dates

  useEffect(() => {
    const node = viewportRef.current

    if (!node) {
      return
    }

    const measure = () => {
      const first = node.querySelector('[data-week-card]')

      if (!(first instanceof HTMLElement)) {
        return
      }

      const styles = getComputedStyle(node)
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
      const stride = weekCardStride(first.getBoundingClientRect().width, gap)
      const count = Math.max(1, Math.floor((node.clientWidth + gap) / stride))

      setVisibleCount(count)
      setVisibleRange(
        visibleWeekRange(datesRef.current, node.scrollLeft, stride, count),
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    node.addEventListener('scroll', measure, { passive: true })

    return () => {
      observer.disconnect()
      node.removeEventListener('scroll', measure)
    }
  }, [datesKey])

  const scrollByCards = useCallback((direction: -1 | 1) => {
    const node = viewportRef.current
    const first = node?.querySelector('[data-week-card]')

    if (!node || !(first instanceof HTMLElement)) {
      return
    }

    const styles = getComputedStyle(node)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    const stride = weekCardStride(first.getBoundingClientRect().width, gap)

    node.scrollBy({
      left: stride * visibleCount * direction,
      behavior: 'smooth',
    })
  }, [visibleCount])

  const scrollToDate = useCallback((ymdDate: string) => {
    const node = viewportRef.current
    const card = node?.querySelector(
      `[data-week-card][data-date="${ymdDate}"]`,
    )

    if (!node || !(card instanceof HTMLElement)) {
      return
    }

    node.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
  }, [])

  return { viewportRef, visibleCount, visibleRange, scrollByCards, scrollToDate }
}
