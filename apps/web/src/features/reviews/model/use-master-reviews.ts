'use client'

import { useEffect, useState } from 'react'
import type { MasterReviewView } from '@lustra/contracts'

import { listMasterReviews } from '@/shared/api/reviews-client'
import { ApiError } from '@/shared/api/http'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useMasterReviews() {
  const [items, setItems] = useState<MasterReviewView[]>([])
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listMasterReviews()

        if (cancelled) {
          return
        }

        const next = response?.items ?? []
        setItems(next)
        setStatus(next.length === 0 ? 'empty' : 'success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setItems([])
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError ? error.message : 'Не удалось загрузить отзывы',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const markReplied = (reviewId: string, text: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === reviewId
          ? { ...item, masterReply: text, repliedAt: new Date().toISOString() }
          : item,
      ),
    )
  }

  return {
    items,
    status,
    errorMessage,
    markReplied,
  }
}
