'use client'

import { useEffect, useState } from 'react'
import type { BookingMasterView } from '@lustra/contracts'

import {
  cancelMasterBooking,
  completeMasterBooking,
  confirmMasterBooking,
  getMasterBooking,
  listMasterBookings,
} from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'
export type MasterBookingsScope = 'upcoming' | 'past' | 'pending'

export function useMasterBookingsList(scope: MasterBookingsScope) {
  const [items, setItems] = useState<BookingMasterView[]>([])
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listMasterBookings(scope)

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
          error instanceof ApiError ? error.message : 'Не удалось загрузить записи',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [scope, reloadToken])

  return {
    items,
    status,
    errorMessage,
    reload: () => setReloadToken((value) => value + 1),
  }
}

export function useMasterBookingDetail(bookingId: string) {
  const [booking, setBooking] = useState<BookingMasterView | null>(null)
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await getMasterBooking(bookingId)

        if (cancelled) {
          return
        }

        if (!response?.booking) {
          setBooking(null)
          setStatus('error')
          setErrorMessage('Запись не найдена')

          return
        }

        setBooking(response.booking)
        setStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setBooking(null)
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError ? error.message : 'Не удалось загрузить запись',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [bookingId])

  const confirm = async () => {
    setBusy(true)
    setActionError(null)

    try {
      const response = await confirmMasterBooking(bookingId)

      if (response?.booking) {
        setBooking(response.booking)
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось подтвердить запись',
      )
    } finally {
      setBusy(false)
    }
  }

  const complete = async () => {
    setBusy(true)
    setActionError(null)

    try {
      const response = await completeMasterBooking(bookingId)

      if (response?.booking) {
        setBooking(response.booking)
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось завершить запись',
      )
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (reason: string) => {
    setBusy(true)
    setActionError(null)

    try {
      const response = await cancelMasterBooking(bookingId, { reason })

      if (response?.booking) {
        setBooking(response.booking)
      }
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Не удалось отменить запись',
      )
    } finally {
      setBusy(false)
    }
  }

  return {
    booking,
    status,
    errorMessage,
    actionError,
    busy,
    confirm,
    complete,
    cancel,
  }
}
