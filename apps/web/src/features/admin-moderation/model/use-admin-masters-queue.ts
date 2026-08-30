'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  AdminMasterCard,
  MasterProfileStatus,
  ModerateMasterAction,
} from '@lumira/contracts'

import { ApiError } from '@/shared/api/http'
import {
  listAdminMasters,
  moderateMaster,
} from '@/shared/api/admin-client'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useAdminMastersQueue(
  status: MasterProfileStatus = 'pending_review',
) {
  const [items, setItems] = useState<AdminMasterCard[]>([])
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
        const response = await listAdminMasters(status)

        if (cancelled) {
          return
        }

        const nextItems = response?.items ?? []
        setItems(nextItems)
        setListStatus(nextItems.length === 0 ? 'empty' : 'success')
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
    async (masterId: string, action: ModerateMasterAction) => {
      setBusyId(masterId)
      setActionError(null)

      try {
        await moderateMaster(masterId, action)
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
