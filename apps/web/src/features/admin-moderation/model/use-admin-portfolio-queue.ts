'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  AdminPortfolioCard,
  MediaModerationStatus,
  ModeratePortfolioAction,
} from '@lumira/contracts'

import { ApiError } from '@/shared/api/http'
import {
  listAdminPortfolio,
  moderatePortfolio,
} from '@/shared/api/admin-client'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useAdminPortfolioQueue(
  status: MediaModerationStatus = 'pending',
) {
  const [items, setItems] = useState<AdminPortfolioCard[]>([])
  const [listStatus, setListStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setListStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listAdminPortfolio(status)

        if (cancelled) {
          return
        }

        const items = response?.items ?? []
        setItems(items)
        setListStatus(items.length === 0 ? 'empty' : 'success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setItems([])
        setListStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить очередь',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [status, reloadToken])

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  const runModerate = useCallback(
    async (itemId: string, action: ModeratePortfolioAction) => {
      setBusyId(itemId)
      setActionError(null)

      try {
        await moderatePortfolio(itemId, action)
        setReloadToken((value) => value + 1)
      } catch (error) {
        setActionError(
          error instanceof ApiError
            ? error.message
            : 'Не удалось выполнить действие',
        )
      } finally {
        setBusyId(null)
      }
    },
    [],
  )

  return {
    items,
    listStatus,
    errorMessage,
    actionError,
    busyId,
    reload,
    runModerate,
  }
}
