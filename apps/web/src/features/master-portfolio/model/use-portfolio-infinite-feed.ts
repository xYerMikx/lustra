import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import {
  initialPortfolioVisibleCount,
  nextPortfolioVisibleCount,
  portfolioFeedPageSize,
} from '@/features/master-portfolio/model/portfolio-feed-window'
import {
  getPortfolioViewportWidth,
  getServerPortfolioViewportWidth,
  subscribePortfolioViewport,
} from '@/features/master-portfolio/model/portfolio-viewport'

const PRELOAD_MARGIN_PX = 240

export function usePortfolioInfiniteFeed(total: number) {
  const [visibleCount, setVisibleCount] = useState(() =>
    initialPortfolioVisibleCount(total),
  )
  const sentinelRef = useRef<HTMLDivElement>(null)
  const viewportWidth = useSyncExternalStore(
    subscribePortfolioViewport,
    getPortfolioViewportWidth,
    getServerPortfolioViewportWidth,
  )
  const pageSize = portfolioFeedPageSize(viewportWidth)

  useEffect(() => {
    const node = sentinelRef.current

    if (!node || visibleCount >= total) {
      return
    }

    const tryLoad = () => {
      const rect = node.getBoundingClientRect()

      if (rect.top >= window.innerHeight + PRELOAD_MARGIN_PX) {
        return
      }

      setVisibleCount((current) =>
        nextPortfolioVisibleCount(current, pageSize, total),
      )
    }

    const observer = new IntersectionObserver(tryLoad, {
      rootMargin: `${PRELOAD_MARGIN_PX}px`,
    })

    observer.observe(node)
    tryLoad()

    return () => {
      observer.disconnect()
    }
  }, [pageSize, total, visibleCount])

  return {
    visibleCount,
    sentinelRef,
    hasMore: visibleCount < total,
  }
}
