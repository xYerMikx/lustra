'use client'

import { useEffect, useState } from 'react'

import { nextCarouselIndex } from '@/shared/ui/preview-carousel/next-carousel-index'

const INTERVAL_MS = 4500

type UsePreviewCarouselInput = {
  total: number
  paused: boolean
}

export function usePreviewCarousel({ total, paused }: UsePreviewCarouselInput) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let timer: number | undefined

    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer)
        timer = undefined
      }
    }

    const start = () => {
      stop()

      if (reduceMotion || paused || document.hidden) {
        return
      }

      timer = window.setInterval(() => {
        if (document.hidden) {
          return
        }

        setIndex((prev) => nextCarouselIndex(prev, total))
      }, INTERVAL_MS)
    }

    start()
    document.addEventListener('visibilitychange', start)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', start)
    }
  }, [paused, total])

  return { index, setIndex }
}
