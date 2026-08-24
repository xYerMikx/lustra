'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  CreateExtraSlotInput,
  CreateManualBookingInput,
  CreateTimeBlockInput,
  MasterCalendarView,
  PutScheduleExceptionInput,
} from '@lustra/contracts'

import { loadManualBookingContext } from '@/features/manual-booking/model/load-manual-booking-context'
import {
  rangeForMode,
  type CalendarViewMode,
} from '@/features/master-calendar/model/calendar-range'
import { createManualBooking } from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'
import {
  closeScheduleSlot,
  createExtraSlot,
  createTimeBlock,
  deleteTimeBlock,
  getMasterCalendar,
  reopenScheduleSlot,
} from '@/shared/api/master-calendar-client'
import {
  deleteScheduleException,
  putScheduleException,
} from '@/shared/api/master-schedule-client'

type CalendarStatus = 'loading' | 'error' | 'empty' | 'success'

export function useCalendarData(
  mode: CalendarViewMode,
  anchorDate: string,
) {
  const [data, setData] = useState<MasterCalendarView | null>(null)
  const [status, setStatus] = useState<CalendarStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const range = rangeForMode(anchorDate, mode)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      setErrorMessage(null)

      try {
        const response = await getMasterCalendar(range.from, range.to)

        if (cancelled) {
          return
        }

        if (!response) {
          setData(null)
          setStatus('error')
          setErrorMessage('Не удалось загрузить календарь')

          return
        }

        setData(response)

        const isEmpty =
          response.slots.length === 0 &&
          response.blocks.length === 0 &&
          response.exceptions.length === 0

        setStatus(isEmpty ? 'empty' : 'success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setData(null)
        setStatus('error')
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Не удалось загрузить календарь',
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [range.from, range.to, reloadToken])

  const reloadCalendar = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  const addBlock = useCallback(
    async (input: CreateTimeBlockInput) => {
      await createTimeBlock(input)
      setReloadToken((value) => value + 1)
    },
    [],
  )

  const removeBlock = useCallback(async (blockId: string) => {
    await deleteTimeBlock(blockId)
    setReloadToken((value) => value + 1)
  }, [])

  const addException = useCallback(
    async (date: string, input: PutScheduleExceptionInput) => {
      await putScheduleException(date, input)
      setReloadToken((value) => value + 1)
    },
    [],
  )

  const removeException = useCallback(async (date: string) => {
    await deleteScheduleException(date)
    setReloadToken((value) => value + 1)
  }, [])

  const loadManualContext = useCallback(async () => {
    return loadManualBookingContext()
  }, [])

  const addManualBooking = useCallback(
    async (input: CreateManualBookingInput) => {
      await createManualBooking(input)
      setReloadToken((value) => value + 1)
    },
    [],
  )

  const addExtraSlot = useCallback(async (input: CreateExtraSlotInput) => {
    await createExtraSlot(input)
    setReloadToken((value) => value + 1)
  }, [])

  const closeSlot = useCallback(async (slotId: string) => {
    await closeScheduleSlot(slotId)
    setReloadToken((value) => value + 1)
  }, [])

  const reopenSlot = useCallback(async (slotId: string) => {
    await reopenScheduleSlot(slotId)
    setReloadToken((value) => value + 1)
  }, [])

  return {
    range,
    data,
    status,
    errorMessage,
    reloadCalendar,
    addBlock,
    removeBlock,
    addException,
    removeException,
    loadManualContext,
    addManualBooking,
    addExtraSlot,
    closeSlot,
    reopenSlot,
  }
}
