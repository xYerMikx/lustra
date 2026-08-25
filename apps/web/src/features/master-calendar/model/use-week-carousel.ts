'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  carouselPageStartIndex,
  scrollLeftForChild,
  visibleWeekRange,
  weekCardStride,
} from '@/features/master-calendar/model/visible-week-range'

export function useWeekCarousel(dates: string[]) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const datesRef = useRef(dates)
  const visibleCountRef = useRef(1)
  const pendingDateRef = useRef<string | null>(null)
  const measuredRef = useRef(false)
  const [visibleCount, setVisibleCount] = useState(1)
  const [visibleRange, setVisibleRange] = useState<{
    from: string
    to: string
  } | null>(null)
  const datesKey = dates.join(',')

  datesRef.current = dates

  const refreshWindow = useCallback(() => {
    const node = viewportRef.current
    const first = node?.querySelector('[data-week-card]')

    if (!node || !(first instanceof HTMLElement) || node.clientWidth <= 0) {
      return
    }

    const styles = getComputedStyle(node)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    const stride = weekCardStride(first.getBoundingClientRect().width, gap)
    const count = Math.max(1, Math.floor((node.clientWidth + gap) / stride))

    measuredRef.current = true
    visibleCountRef.current = count
    setVisibleCount(count)
    setVisibleRange(
      visibleWeekRange(datesRef.current, node.scrollLeft, stride, count),
    )
  }, [])

  const snapToDate = useCallback((ymdDate: string) => {
    const node = viewportRef.current

    if (!node || !measuredRef.current || node.clientWidth <= 0) {
      return false
    }

    const startIndex = carouselPageStartIndex(
      datesRef.current,
      ymdDate,
      visibleCountRef.current,
    )
    const startDate = datesRef.current[startIndex]
    const card = startDate
      ? node.querySelector(`[data-week-card][data-date="${startDate}"]`)
      : null

    if (!(card instanceof HTMLElement)) {
      return false
    }

    const nextLeft = scrollLeftForChild(
      node.scrollLeft,
      node.getBoundingClientRect().left,
      card.getBoundingClientRect().left,
    )

    node.scrollTo({ left: nextLeft, behavior: 'auto' })

    return true
  }, [])

  const flushPending = useCallback(() => {
    const pending = pendingDateRef.current

    if (!pending) {
      return
    }

    if (snapToDate(pending)) {
      pendingDateRef.current = null

      refreshWindow()
    }
  }, [refreshWindow, snapToDate])

  useEffect(() => {
    const node = viewportRef.current

    if (!node) {
      return
    }

    const onLayout = () => {
      refreshWindow()

      flushPending()
    }

    onLayout()

    const observer = new ResizeObserver(onLayout)

    observer.observe(node)
    node.addEventListener('scroll', refreshWindow, { passive: true })

    return () => {
      observer.disconnect()
      node.removeEventListener('scroll', refreshWindow)
    }
  }, [datesKey, flushPending, refreshWindow])

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
      left: stride * visibleCountRef.current * direction,
      behavior: 'smooth',
    })
  }, [])

  const scrollToDate = useCallback((ymdDate: string) => {
    pendingDateRef.current = ymdDate

    flushPending()
  }, [flushPending])

  return { viewportRef, visibleCount, visibleRange, scrollByCards, scrollToDate }
}
