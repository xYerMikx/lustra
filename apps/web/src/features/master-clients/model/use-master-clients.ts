'use client'

import { useEffect, useState } from 'react'
import type { MasterClientView } from '@lustra/contracts'

import { listMasterClients } from '@/shared/api/master-clients-client'
import { ApiError } from '@/shared/api/http'

export type ClientsTab = 'search' | 'frequent'
export type ListStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success'

export function useMasterClients(tab: ClientsTab, query: string) {
  const [items, setItems] = useState<MasterClientView[]>([])
  const [status, setStatus] = useState<ListStatus>(
    tab === 'search' ? 'idle' : 'loading',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = () => {
    setReloadToken((value) => value + 1)
  }

  useEffect(() => {
    const trimmed = query.trim()

    if (tab === 'search' && trimmed.length === 0) {
      setItems([])
      setStatus('idle')
      setErrorMessage(null)

      return
    }

    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listMasterClients(
          tab === 'search' ? trimmed : '',
          tab === 'frequent' ? 'frequent' : 'recent',
        )

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
            : 'Не удалось загрузить клиентов',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [tab, query, reloadToken])

  return {
    items,
    status,
    errorMessage,
    reload,
  }
}
