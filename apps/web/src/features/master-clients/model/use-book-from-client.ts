'use client'

import { useState } from 'react'
import type {
  CreateManualBookingInput,
  MasterClientView,
  ServiceView,
} from '@lustra/contracts'

import { loadManualBookingFormData } from '@/features/manual-booking/model/load-manual-booking-form-data'
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
      const formData = await loadManualBookingFormData()

      if (formData.services.length === 0) {
        setNotice('Сначала добавьте услугу в кабинете')

        return
      }

      setDialog({ client, ...formData })
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
