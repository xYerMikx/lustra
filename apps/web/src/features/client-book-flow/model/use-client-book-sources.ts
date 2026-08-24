'use client'

import { useEffect, useState } from 'react'
import type {
  RecommendedServiceView,
  ServiceCategoryView,
  ServiceTemplateView,
} from '@lustra/contracts'

import { listClientBookings } from '@/shared/api/bookings-client'
import {
  fetchCatalogCategories,
  fetchCatalogServiceTemplates,
} from '@/shared/api/catalog-browser-client'
import { ApiError } from '@/shared/api/http'
import { fetchClientRecommendations } from '@/shared/api/recommendations-client'
import type { PastBookingServiceRef } from '@/features/client-book-flow/model/build-service-options'

type SourcesStatus = 'loading' | 'error' | 'success'

export function useClientBookSources() {
  const [status, setStatus] = useState<SourcesStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<
    RecommendedServiceView[]
  >([])
  const [pastBookings, setPastBookings] = useState<PastBookingServiceRef[]>([])
  const [categories, setCategories] = useState<ServiceCategoryView[]>([])
  const [templates, setTemplates] = useState<ServiceTemplateView[]>([])
  const [reloadToken, setReloadToken] = useState(0)

  const reload = () => {
    setReloadToken((value) => value + 1)
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const [recs, past, categoryList, templateList] = await Promise.all([
          loadRecommendations(),
          loadPastBookings(),
          fetchCatalogCategories(),
          fetchCatalogServiceTemplates(),
        ])

        if (cancelled) {
          return
        }

        setRecommendations(recs)
        setPastBookings(past)
        setCategories(categoryList?.categories ?? [])
        setTemplates(templateList?.templates ?? [])
        setStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setRecommendations([])
        setPastBookings([])
        setCategories([])
        setTemplates([])
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить услуги',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return {
    status,
    errorMessage,
    recommendations,
    pastBookings,
    categories,
    templates,
    reload,
  }
}

async function loadRecommendations(): Promise<RecommendedServiceView[]> {
  try {
    const response = await fetchClientRecommendations()

    if (!response?.recommendations?.length) {
      return []
    }

    return response.recommendations
  } catch {
    return []
  }
}

async function loadPastBookings(): Promise<PastBookingServiceRef[]> {
  try {
    const response = await listClientBookings('past')

    return (response?.items ?? []).map((item) => ({
      serviceId: item.serviceId,
      serviceTitle: item.serviceTitle,
      masterId: item.masterId,
    }))
  } catch {
    return []
  }
}
