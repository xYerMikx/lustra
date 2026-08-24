'use client'

import { useState } from 'react'
import type {
  CreateManualBookingInput,
  MasterClientView,
  ServiceView,
} from '@lustra/contracts'

import { loadManualBookingContext } from '@/features/master-clients/model/load-manual-booking-context'
import { createManualBooking } from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'

type BookDialogState = {
  client: MasterClientView
  services: ServiceView[]
  clients: MasterClientView[]
}

export function useBookFromClient(onBooked: () => void) {
  const [dialog, setDialog] = useState<BookDialogState | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const openForClient = async (client: MasterClientView) => {
    setNotice(null)
    setBusyId(client.id)

    try {
      const context = await loadManualBookingContext()

      if (context.services.length === 0) {
        setNotice('Сначала добавьте услугу в кабинете')

        return
      }

      setDialog({ client, ...context })
    } catch (error) {
      setNotice(
        error instanceof ApiError
          ? error.message
          : 'Не удалось открыть запись',
      )
    } finally {
      setBusyId(null)
    }
  }

  const submitBooking = async (input: CreateManualBookingInput) => {
    await createManualBooking(input)
    setDialog(null)
    setNotice('Клиент записан')
    onBooked()
  }

  return {
    dialog,
    notice,
    busyId,
    openForClient,
    submitBooking,
    closeDialog: () => setDialog(null),
  }
}
