'use client'

import { useCallback, useMemo, useState } from 'react'
import type { PublicMasterView } from '@lustra/contracts'

import { buildServiceOptions } from '@/features/client-book-flow/model/build-service-options'
import { rankMastersForService } from '@/features/client-book-flow/model/rank-masters-for-service'
import type {
  BookMasterCandidate,
  ClientBookServiceOption,
  ClientBookStep,
} from '@/features/client-book-flow/model/types'
import { useClientBookMasters } from '@/features/client-book-flow/model/use-client-book-masters'
import { useClientBookSources } from '@/features/client-book-flow/model/use-client-book-sources'
import { fetchPublicMasterBySlug } from '@/shared/api/catalog-browser-client'
import { ApiError } from '@/shared/api/http'

export function useClientBookFlow() {
  const sources = useClientBookSources()
  const [step, setStep] = useState<ClientBookStep>('service')
  const [selectedService, setSelectedService] =
    useState<ClientBookServiceOption | null>(null)
  const [selectedMaster, setSelectedMaster] =
    useState<BookMasterCandidate | null>(null)
  const [publicMaster, setPublicMaster] = useState<PublicMasterView | null>(null)
  const [masterBusy, setMasterBusy] = useState(false)
  const [masterError, setMasterError] = useState<string | null>(null)
  const masters = useClientBookMasters(selectedService)

  const serviceOptions = useMemo(
    () =>
      buildServiceOptions({
        recommendations: sources.recommendations,
        pastBookings: sources.pastBookings,
        templates: sources.templates,
      }),
    [sources.pastBookings, sources.recommendations, sources.templates],
  )

  const masterOptions = useMemo(() => {
    if (!selectedService || masters.status !== 'success') {
      return []
    }

    return rankMastersForService({
      service: selectedService,
      favorites: masters.favorites,
      catalog: masters.catalog,
    })
  }, [masters.catalog, masters.favorites, masters.status, selectedService])

  const pickService = useCallback((option: ClientBookServiceOption) => {
    setSelectedService(option)
    setSelectedMaster(null)
    setPublicMaster(null)
    setMasterError(null)
    setStep('master')
  }, [])

  const pickMaster = useCallback(async (candidate: BookMasterCandidate) => {
    setMasterBusy(true)
    setMasterError(null)

    try {
      const profile = await fetchPublicMasterBySlug(candidate.slug)

      setSelectedMaster(candidate)
      setPublicMaster(profile)
      setStep('slot')
    } catch (error) {
      setMasterError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось загрузить мастера',
      )
    } finally {
      setMasterBusy(false)
    }
  }, [])

  const backToService = useCallback(() => {
    setStep('service')
    setSelectedService(null)
    setSelectedMaster(null)
    setPublicMaster(null)
    setMasterError(null)
  }, [])

  const backToMaster = useCallback(() => {
    setStep('master')
    setPublicMaster(null)
    setMasterError(null)
  }, [])

  return {
    step,
    sources,
    serviceOptions,
    selectedService,
    masters,
    masterOptions,
    selectedMaster,
    publicMaster,
    masterBusy,
    masterError,
    pickService,
    pickMaster,
    backToService,
    backToMaster,
  }
}
