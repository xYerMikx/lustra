'use client'

import { useEffect, useState } from 'react'
import type { ReceivedClientReviewView } from '@lustra/contracts'

import { listClientReviews } from '@/shared/api/reviews-client'
import { ApiError } from '@/shared/api/http'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useClientReviews() {
  const [reviews, setReviews] = useState<ReceivedClientReviewView[]>([])
  const [ratingAvg, setRatingAvg] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listClientReviews()

        if (cancelled) {
          return
        }

        const nextReviews = response?.items ?? []
        setReviews(nextReviews)
        setRatingAvg(response?.ratingAvg ?? 0)
        setRatingCount(response?.ratingCount ?? 0)
        setStatus(nextReviews.length === 0 ? 'empty' : 'success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setReviews([])
        setRatingAvg(0)
        setRatingCount(0)
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить отзывы',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    reviews,
    ratingAvg,
    ratingCount,
    status,
    errorMessage,
  }
}
