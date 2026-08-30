'use client'

import { useEffect, useState } from 'react'
import type { MeResponse } from '@lumira/contracts'

import { loadSession } from '@/features/auth/model/load-session'
import {
  addFavorite,
  getFavoriteStatus,
  removeFavorite,
} from '@/shared/api/favorites-client'
import { ApiError } from '@/shared/api/http'

type Viewer = 'loading' | 'guest' | 'client' | 'other'

export function useFavoriteToggle(masterId: string) {
  const [viewer, setViewer] = useState<Viewer>('loading')
  const [favorited, setFavorited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const me: MeResponse | null = await loadSession()

      if (cancelled) {
        return
      }

      if (!me) {
        setViewer('guest')

        return
      }

      if (me.role !== 'client') {
        setViewer('other')

        return
      }

      try {
        const status = await getFavoriteStatus(masterId)

        if (cancelled) {
          return
        }

        setFavorited(status?.favorited === true)
        setViewer('client')
      } catch (error) {
        if (cancelled) {
          return
        }

        if (error instanceof ApiError && error.status === 401) {
          setViewer('guest')

          return
        }

        setViewer('client')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось проверить избранное',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [masterId])

  const toggleFavorite = async () => {
    if (viewer !== 'client' || busy) {
      return
    }

    setBusy(true)
    setErrorMessage(null)

    try {
      const next = favorited
        ? await removeFavorite(masterId)
        : await addFavorite(masterId)

      setFavorited(next?.favorited === true)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Не удалось обновить избранное',
      )
    } finally {
      setBusy(false)
    }
  }

  return {
    viewer,
    favorited,
    busy,
    errorMessage,
    toggleFavorite,
  }
}
