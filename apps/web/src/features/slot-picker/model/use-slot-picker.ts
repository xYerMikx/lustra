'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  AvailabilityDayView,
  AvailabilityResponse,
  AvailabilitySlotView,
  BookingClientView,
  HoldSlotResponse,
  PublicServiceView,
} from '@lustra/contracts'

import {
  availabilityRangeFromToday,
  buildHoldIdempotencyKey,
  clearBookingDraft,
  saveBookingDraft,
} from '@/features/slot-picker/model/booking-draft'
import { remainingHoldMs } from '@/features/slot-picker/model/hold-timer'
import { getMe } from '@/shared/api/auth-client'
import { fetchMasterAvailability } from '@/shared/api/availability-client'
import {
  confirmBooking,
  createBookingHold,
} from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'

type LoadStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success'
type FlowStep = 'pick' | 'confirm' | 'success'

export function useSlotPicker(input: {
  masterId: string
  masterSlug: string
  services: PublicServiceView[]
}) {
  const router = useRouter()
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const hasShownAvailability = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [justTakenStartsAt, setJustTakenStartsAt] = useState<string | null>(null)
  const [flowStep, setFlowStep] = useState<FlowStep>('pick')
  const [hold, setHold] = useState<HoldSlotResponse | null>(null)
  const [booking, setBooking] = useState<BookingClientView | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [holdRemainingMs, setHoldRemainingMs] = useState(0)

  const range = availabilityRangeFromToday(14)

  const reloadAvailability = useCallback(async () => {
    if (!serviceId) {
      setAvailability(null)
      setStatus('idle')

      return
    }

    setErrorMessage(null)

    if (hasShownAvailability.current) {
      setIsRefreshing(true)
    } else {
      setStatus('loading')
    }

    try {
      const response = await fetchMasterAvailability(input.masterId, {
        serviceId,
        from: range.from,
        to: range.to,
      })

      if (!response) {
        if (!hasShownAvailability.current) {
          setAvailability(null)
          setStatus('error')
        }

        setErrorMessage('Не удалось загрузить слоты')

        return
      }

      setAvailability(response)

      const firstOpen = response.days.find((day) => day.hasOpen)
      setSelectedDate((current) => {
        if (current && response.days.some((day) => day.date === current)) {
          return current
        }

        return firstOpen?.date ?? response.days[0]?.date ?? null
      })

      const hasOpenSlots = response.days.some((day) => day.hasOpen)

      hasShownAvailability.current = true
      setStatus(hasOpenSlots ? 'success' : 'empty')
    } catch (error) {
      if (!hasShownAvailability.current) {
        setAvailability(null)
        setStatus('error')
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Не удалось загрузить слоты',
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [input.masterId, serviceId, range.from, range.to])

  useEffect(() => {
    void reloadAvailability()
  }, [reloadAvailability])

  useEffect(() => {
    if (flowStep !== 'confirm' || !hold) {
      return
    }

    const tick = () => {
      const remaining = remainingHoldMs(hold.holdExpiresAt)

      setHoldRemainingMs(remaining)

      if (remaining <= 0) {
        setFlowStep('pick')
        setHold(null)
        void reloadAvailability().then(() => {
          setErrorMessage('Мы держали место 10 минут — выберите время снова')
        })
      }
    }

    tick()
    const timerId = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [flowStep, hold, reloadAvailability])

  const selectService = useCallback((nextServiceId: string) => {
    setServiceId(nextServiceId)
    setSelectedSlot(null)
    setFlowStep('pick')
    setHold(null)
    setBooking(null)
    setJustTakenStartsAt(null)
  }, [])

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setJustTakenStartsAt(null)
  }, [])

  const selectSlot = useCallback((slot: AvailabilitySlotView) => {
    setSelectedSlot(slot)
    setJustTakenStartsAt(null)
  }, [])

  const redirectToLogin = useCallback(() => {
    const next = `/m/${input.masterSlug}#booking`

    router.push(`/app/login?next=${encodeURIComponent(next)}`)
  }, [input.masterSlug, router])

  const startHold = useCallback(async () => {
    if (!serviceId || !selectedSlot) {
      return
    }

    saveBookingDraft({
      masterId: input.masterId,
      masterSlug: input.masterSlug,
      serviceId,
      startsAt: selectedSlot.startsAt,
    })

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const me = await getMe()

      if (!me) {
        redirectToLogin()

        return
      }

      if (me.role !== 'client') {
        setErrorMessage('Записаться можно только из аккаунта клиента')

        return
      }

      const response = await createBookingHold(
        {
          masterId: input.masterId,
          serviceId,
          startsAt: selectedSlot.startsAt,
        },
        buildHoldIdempotencyKey({
          masterId: input.masterId,
          serviceId,
          startsAt: selectedSlot.startsAt,
        }),
      )

      if (!response) {
        setErrorMessage('Не удалось удержать слот')

        return
      }

      setHold(response)
      setFlowStep('confirm')
      setHoldRemainingMs(remainingHoldMs(response.holdExpiresAt))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        redirectToLogin()

        return
      }

      if (error instanceof ApiError && error.code === 'SLOT_TAKEN') {
        setJustTakenStartsAt(selectedSlot.startsAt)
        setSelectedSlot(null)
        await reloadAvailability()
        setErrorMessage('Это время только что заняли — вот ближайшие окна')

        return
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Не удалось удержать слот',
      )
    } finally {
      setSubmitting(false)
    }
  }, [
    input.masterId,
    input.masterSlug,
    redirectToLogin,
    reloadAvailability,
    selectedSlot,
    serviceId,
  ])

  const submitConfirm = useCallback(async () => {
    if (!hold) {
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await confirmBooking(hold.bookingId, {
        comment: comment.trim() ? comment.trim() : undefined,
      })

      if (!response) {
        setErrorMessage('Не удалось подтвердить запись')

        return
      }

      clearBookingDraft()
      setBooking(response.booking)
      setFlowStep('success')
      setHold(null)
      await reloadAvailability()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'HOLD_EXPIRED') {
        setFlowStep('pick')
        setHold(null)
        await reloadAvailability()
        setErrorMessage('Мы держали место 10 минут — выберите время снова')

        return
      }

      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Не удалось подтвердить запись',
      )
    } finally {
      setSubmitting(false)
    }
  }, [comment, hold, reloadAvailability])

  const backToPick = useCallback(() => {
    setFlowStep('pick')
    setHold(null)
  }, [])

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
    isRefreshing,
    errorMessage,
    justTakenStartsAt,
    flowStep,
    hold,
    booking,
    comment,
    submitting,
    holdRemainingMs,
    timezone: availability?.timezone ?? 'Europe/Minsk',
    selectService,
    selectDate,
    selectSlot,
    setComment,
    startHold,
    submitConfirm,
    backToPick,
  }
}
