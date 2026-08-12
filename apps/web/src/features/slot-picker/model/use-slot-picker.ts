'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  AvailabilityDayView,
  AvailabilityResponse,
  AvailabilitySlotView,
  PublicServiceView,
} from '@lustra/contracts'

import {
  availabilityRangeFromToday,
  saveBookingDraft,
} from '@/features/slot-picker/model/booking-draft'
import { fetchMasterAvailability } from '@/shared/api/availability-client'
import { ApiError } from '@/shared/api/http'

type LoadStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success'

export function useSlotPicker(input: {
  masterId: string
  masterSlug: string
  services: PublicServiceView[]
}) {
  const [serviceId, setServiceId] = useState<string | null>(
    input.services[0]?.id ?? null,
  )
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotView | null>(
    null,
  )
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(
    null,
  )
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [draftSaved, setDraftSaved] = useState(false)

  const range = availabilityRangeFromToday(14)

  useEffect(() => {
    if (!serviceId) {
      setAvailability(null)
      setStatus('idle')

      return
    }

    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)
      setSelectedSlot(null)
      setDraftSaved(false)

      try {
        const response = await fetchMasterAvailability(input.masterId, {
          serviceId,
          from: range.from,
          to: range.to,
        })

        if (cancelled) {
          return
        }

        if (!response) {
          setAvailability(null)
          setStatus('error')
          setErrorMessage('Не удалось загрузить слоты')

          return
        }

        setAvailability(response)

        const firstOpen = response.days.find((day) => day.hasOpen)
        setSelectedDate(firstOpen?.date ?? response.days[0]?.date ?? null)

        setStatus(
          response.days.some((day) => day.hasOpen) ? 'success' : 'empty',
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        setAvailability(null)
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить слоты',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [input.masterId, serviceId, range.from, range.to])

  const selectService = useCallback((nextServiceId: string) => {
    setServiceId(nextServiceId)
  }, [])

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setDraftSaved(false)
  }, [])

  const selectSlot = useCallback((slot: AvailabilitySlotView) => {
    setSelectedSlot(slot)
    setDraftSaved(false)
  }, [])

  const confirmSelection = useCallback(() => {
    if (!serviceId || !selectedSlot) {
      return
    }

    saveBookingDraft({
      masterId: input.masterId,
      masterSlug: input.masterSlug,
      serviceId,
      startsAt: selectedSlot.startsAt,
    })
    setDraftSaved(true)
  }, [input.masterId, input.masterSlug, serviceId, selectedSlot])

  const days: AvailabilityDayView[] = availability?.days ?? []
  const daySlots =
    days.find((day) => day.date === selectedDate)?.slots ?? []

  return {
    serviceId,
    selectedDate,
    selectedSlot,
    days,
    daySlots,
    status,
    errorMessage,
    draftSaved,
    timezone: availability?.timezone ?? 'Europe/Minsk',
    selectService,
    selectDate,
    selectSlot,
    confirmSelection,
  }
}
