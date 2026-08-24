'use client'

import { useEffect, useState } from 'react'
import type { CatalogMasterCard } from '@lustra/contracts'

import {
  fetchCatalogMasters,
} from '@/shared/api/catalog-browser-client'
import { listFavorites } from '@/shared/api/favorites-client'
import { ApiError } from '@/shared/api/http'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'

type MastersStatus = 'idle' | 'loading' | 'error' | 'success'

export function useClientBookMasters(
  service: ClientBookServiceOption | null,
) {
  const [status, setStatus] = useState<MastersStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<CatalogMasterCard[]>([])
  const [catalog, setCatalog] = useState<CatalogMasterCard[]>([])
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!service) {
      setStatus('idle')
      setFavorites([])
      setCatalog([])
      setErrorMessage(null)

      return
    }

    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const [favoriteList, catalogItems] = await Promise.all([
          loadFavorites(),
          loadCatalogForService(service),
        ])

        if (cancelled) {
          return
        }

        setFavorites(favoriteList)
        setCatalog(catalogItems)
        setStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setFavorites([])
        setCatalog([])
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить мастеров',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [service, reloadToken])

  return {
    status,
    errorMessage,
    favorites,
    catalog,
    reload: () => setReloadToken((value) => value + 1),
  }
}

async function loadFavorites(): Promise<CatalogMasterCard[]> {
  try {
    const response = await listFavorites()

    return response?.items ?? []
  } catch {
    return []
  }
}

async function loadCatalogForService(
  service: ClientBookServiceOption,
): Promise<CatalogMasterCard[]> {
  const byService = await fetchCatalogMasters({ service: service.title })

  if (byService?.items?.length) {
    return byService.items
  }

  if (service.categorySlug) {
    const byCategory = await fetchCatalogMasters({
      category: service.categorySlug,
    })

    if (byCategory?.items?.length) {
      return byCategory.items
    }
  }

  const fallback = await fetchCatalogMasters({})

  return fallback?.items ?? []
}
