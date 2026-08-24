'use client'

import { useState } from 'react'
import type { CreateManualBookingInput } from '@lustra/contracts'

import {
  loadManualBookingFormData,
  type ManualBookingFormData,
} from '@/features/manual-booking/model/load-manual-booking-form-data'
import { ManualBookingDialog } from '@/features/manual-booking/ui/manual-booking-dialog'
import { todayYmdDate } from '@/features/master-calendar/model/calendar-range'
import { createManualBooking } from '@/shared/api/bookings-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/toast'

type MasterBookClientButtonProps = {
  onBooked: () => void
  testId: string
}

export function MasterBookClientButton({
  onBooked,
  testId,
}: MasterBookClientButtonProps) {
  const toast = useToast()
  const [opening, setOpening] = useState(false)
  const [dialog, setDialog] = useState<ManualBookingFormData | null>(null)
  const today = todayYmdDate()

  const openDialog = async () => {
    setOpening(true)

    try {
      const formData = await loadManualBookingFormData()

      if (formData.services.length === 0) {
        toast.error('Сначала добавьте услугу в кабинете')

        return
      }

      setDialog(formData)
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Не удалось открыть запись',
      )
    } finally {
      setOpening(false)
    }
  }

  const closeDialog = () => {
    setDialog(null)
  }

  const submitBooking = async (input: CreateManualBookingInput) => {
    await createManualBooking(input)
    toast.success('Клиент записан')
    onBooked()
  }

  return (
    <>
      <Button
        type="button"
        disabled={opening}
        data-testid={testId}
        onClick={() => {
          void openDialog()
        }}
      >
        Записать клиента
      </Button>
      {dialog ? (
        <ManualBookingDialog
          defaultDate={today}
          defaultStartsAt={null}
          minDate={today}
          services={dialog.services}
          clients={dialog.clients}
          onClose={closeDialog}
          onSubmit={submitBooking}
        />
      ) : null}
    </>
  )
}
