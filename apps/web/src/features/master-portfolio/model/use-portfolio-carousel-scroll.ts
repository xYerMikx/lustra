import { useEffect, useRef } from 'react'

import {
  carouselIndexFromScroll,
  clampCarouselIndex,
  scrollLeftForIndex,
} from '@/features/master-portfolio/model/carousel-index-from-scroll'

const SNAP_THRESHOLD = 0.05

type UsePortfolioCarouselScrollOptions = {
  index: number
  length: number
  onIndexChange: (index: number) => void
}

export function usePortfolioCarouselScroll({
  index,
  length,
  onIndexChange,
}: UsePortfolioCarouselScrollOptions) {
  const trackRef = useRef<HTMLUListElement>(null)
  const pendingIndexRef = useRef(index)
  const programmaticRef = useRef(false)
  const skipScrollRef = useRef(false)
  const indexRef = useRef(index)
  const lengthRef = useRef(length)
  const onIndexChangeRef = useRef(onIndexChange)

  indexRef.current = index
  lengthRef.current = length
  onIndexChangeRef.current = onIndexChange

  const syncScroll = (nextIndex: number, behavior: ScrollBehavior) => {
    const track = trackRef.current

    if (!track || track.clientWidth <= 0) {
      return
    }

    programmaticRef.current = behavior === 'smooth'
    pendingIndexRef.current = nextIndex

    track.scrollTo({
      left: scrollLeftForIndex(nextIndex, track.clientWidth),
      behavior,
    })
  }

  useEffect(() => {
    const track = trackRef.current

    if (!track) {
      return
    }

    const align = () => {
      syncScroll(pendingIndexRef.current, 'auto')
    }

    align()

    const observer = new ResizeObserver(align)
    observer.observe(track)

    return () => {
      observer.disconnect()
    }
  }, [length])

  useEffect(() => {
    pendingIndexRef.current = index

    if (skipScrollRef.current) {
      skipScrollRef.current = false

      return
    }

    const track = trackRef.current

    if (!track || track.clientWidth <= 0) {
      return
    }

    const expected = scrollLeftForIndex(index, track.clientWidth)

    if (Math.abs(track.scrollLeft - expected) < 2) {
      programmaticRef.current = false

      return
    }

    syncScroll(index, 'smooth')
  }, [index])

  const handleScroll = () => {
    const track = trackRef.current

    if (!track || track.clientWidth <= 0) {
      return
    }

    const next = carouselIndexFromScroll(
      track.scrollLeft,
      track.clientWidth,
      lengthRef.current,
    )

    if (programmaticRef.current) {
      if (next !== pendingIndexRef.current) {
        return
      }

      programmaticRef.current = false
    } else {
      const raw = track.scrollLeft / track.clientWidth
      const nearest = Math.round(raw)

      if (Math.abs(raw - nearest) > SNAP_THRESHOLD) {
        return
      }
    }

    if (next !== indexRef.current) {
      skipScrollRef.current = true
      pendingIndexRef.current = next

      onIndexChangeRef.current(next)
    }
  }

  const goTo = (delta: number) => {
    const next = clampCarouselIndex(
      pendingIndexRef.current + delta,
      lengthRef.current,
    )

    if (next === pendingIndexRef.current) {
      return
    }

    pendingIndexRef.current = next

    onIndexChangeRef.current(next)
  }

  return {
    trackRef,
    handleScroll,
    goTo,
    canGoPrev: index > 0,
    canGoNext: index < length - 1,
  }
}
