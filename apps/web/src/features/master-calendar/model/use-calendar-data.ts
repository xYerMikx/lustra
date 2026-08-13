'use client'

import { useCallback, useEffect, useState } from 'react'
import type {
  CreateManualBookingInput,
  CreateTimeBlockInput,
  MasterCalendarView,
  MasterClientView,
  PutScheduleExceptionInput,
} from '@lustra/contracts'

import {
  rangeForMode,
  shiftAnchorDate,
  todayYmdDate,
  type CalendarViewMode,
} from '@/features/master-calendar/model/calendar-range'
import { createManualBooking } from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'
import {
  createTimeBlock,
  deleteTimeBlock,
  getMasterCalendar,
} from '@/shared/api/master-calendar-client'
import {
  deleteScheduleException,
  putScheduleException,
} from '@/shared/api/master-schedule-client'
import { listMasterClients } from '@/shared/api/master-clients-client'
import { listMasterServices } from '@/shared/api/master-services-client'

type CalendarStatus = 'loading' | 'error' | 'empty' | 'success'

export function useCalendarData() {
  const [mode, setMode] = useState<CalendarViewMode>('week')
  const [anchorDate, setAnchorDate] = useState(() => todayYmdDate())
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

  const goPrev = useCallback(() => {
    setAnchorDate((current) => shiftAnchorDate(current, mode, -1))
  }, [mode])

  const goNext = useCallback(() => {
    setAnchorDate((current) => shiftAnchorDate(current, mode, 1))
  }, [mode])

  const goToday = useCallback(() => {
    setAnchorDate(todayYmdDate())
  }, [])

  const changeMode = useCallback((next: CalendarViewMode) => {
    setMode(next)
  }, [])

  const selectDay = useCallback((ymdDate: string) => {
    setAnchorDate(ymdDate)
    setMode('day')
  }, [])

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
    const [servicesResponse, clientsResponse] = await Promise.all([
      listMasterServices(),
      listMasterClients(),
    ])

    const services = (servicesResponse?.services ?? []).filter(
      (service) => service.isActive,
    )
    const clients: MasterClientView[] = clientsResponse?.items ?? []

    return { services, clients }
  }, [])

  const addManualBooking = useCallback(
    async (input: CreateManualBookingInput) => {
      await createManualBooking(input)
      setReloadToken((value) => value + 1)
    },
    [],
  )

  return {
    mode,
    anchorDate,
    range,
    data,
    status,
    errorMessage,
    goPrev,
    goNext,
    goToday,
    changeMode,
    selectDay,
    reloadCalendar,
    addBlock,
    removeBlock,
    addException,
    removeException,
    loadManualContext,
    addManualBooking,
  }
}
