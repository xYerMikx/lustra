'use client'

import { useEffect, useState } from 'react'
import type { BookingClientView } from '@lumira/contracts'

import {
  cancelClientBooking,
  getClientBooking,
  listClientBookings,
} from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'

type ListStatus = 'loading' | 'error' | 'empty' | 'success'

export function useClientBookingsList(scope: 'upcoming' | 'past') {
  const [items, setItems] = useState<BookingClientView[]>([])
  const [status, setStatus] = useState<ListStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await listClientBookings(scope)

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

export function useClientBookingDetail(bookingId: string) {
  const [booking, setBooking] = useState<BookingClientView | null>(null)
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
        const response = await getClientBooking(bookingId)

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

  const cancel = async (reason?: string) => {
    setBusy(true)
    setActionError(null)

    try {
      const response = await cancelClientBooking(
        bookingId,
        reason ? { reason } : {},
      )

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
    cancel,
  }
}
