'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PortfolioItemView } from '@lustra/contracts'

import { preparePortfolioUpload } from '@/features/master-portfolio/model/prepare-portfolio-upload'
import { ApiError } from '@/shared/api/http'
import {
  deleteMasterPortfolio,
  listMasterPortfolio,
  patchMasterPortfolio,
  uploadMasterPortfolio,
} from '@/shared/api/master-portfolio-client'

type LoadStatus = 'loading' | 'error' | 'empty' | 'success'

export function useMasterPortfolio() {
  const [items, setItems] = useState<PortfolioItemView[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listMasterPortfolio()

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
            : 'Не удалось загрузить портфолио',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setBusy(true)
    setErrorMessage(null)

    try {
      for (const file of Array.from(files)) {
        const prepared = await preparePortfolioUpload(file)
        await uploadMasterPortfolio(prepared)
      }

      setReloadToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не удалось загрузить фото',
      )
    } finally {
      setBusy(false)
    }
  }, [])

  const setCover = useCallback(async (id: string) => {
    setBusy(true)
    setErrorMessage(null)

    try {
      await patchMasterPortfolio(id, { isCover: true })
      setReloadToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не удалось сделать обложкой',
      )
    } finally {
      setBusy(false)
    }
  }, [])

  const removeItem = useCallback(async (id: string) => {
    setBusy(true)
    setErrorMessage(null)

    try {
      await deleteMasterPortfolio(id)
      setReloadToken((value) => value + 1)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не удалось удалить фото',
      )
    } finally {
      setBusy(false)
    }
  }, [])

  return {
    items,
    status,
    errorMessage,
    busy,
    reload,
    uploadFiles,
    setCover,
    removeItem,
  }
}
