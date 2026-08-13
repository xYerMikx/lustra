'use client'

import { useEffect, useState } from 'react'
import type { CatalogMasterCard } from '@lustra/contracts'

import { listFavorites } from '@/shared/api/favorites-client'
import { ApiError } from '@/shared/api/http'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useFavoritesList() {
  const [items, setItems] = useState<CatalogMasterCard[]>([])
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listFavorites()

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
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить избранное',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return {
    items,
    status,
    errorMessage,
    reload: () => setReloadToken((value) => value + 1),
  }
}
