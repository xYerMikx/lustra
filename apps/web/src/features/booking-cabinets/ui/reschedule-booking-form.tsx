'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { RescheduleBookingInput } from '@lustra/contracts'

import {
  buildRescheduleFormDefaults,
  toRescheduleInput,
  type RescheduleFormValues,
} from '@/features/booking-cabinets/model/to-reschedule-input'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

type RescheduleBookingFormProps = {
  currentStartsAt: string
  busy: boolean
  onSubmit: (input: RescheduleBookingInput) => Promise<void>
}

export function RescheduleBookingForm({
  currentStartsAt,
  busy,
  onSubmit,
}: RescheduleBookingFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    defaultValues: buildRescheduleFormDefaults(currentStartsAt),
  })

  const submitForm = async (values: RescheduleFormValues) => {
    setFormError(null)

    const payload = toRescheduleInput(values)

    if (!payload) {
      setFormError('Укажите причину и новое время')

      return
    }

    try {
      await onSubmit(payload)
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message)

        return
      }

      setFormError('Не удалось перенести запись')
    }
  }

  return (
    <form
      className={styles.detailBlock}
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      <p className={styles.rescheduleTitle}>Перенести запись</p>
      <label className={styles.fieldLabel} htmlFor="reschedule-date">
        Дата
      </label>
      <input
        id="reschedule-date"
        className={styles.reasonField}
        type="date"
        {...register('date', { required: true })}
      />
      {errors.date ? (
        <span className={styles.error}>Укажите дату</span>
      ) : null}
      <label className={styles.fieldLabel} htmlFor="reschedule-time">
        Начало
      </label>
      <input
        id="reschedule-time"
        className={styles.reasonField}
        type="time"
        {...register('startTime', { required: true })}
      />
      {errors.startTime ? (
        <span className={styles.error}>Укажите время</span>
      ) : null}
      <label className={styles.fieldLabel} htmlFor="reschedule-reason">
        Причина переноса
      </label>
      <input
        id="reschedule-reason"
        className={styles.reasonField}
        maxLength={500}
        {...register('reason', { required: true })}
      />
      {errors.reason ? (
        <span className={styles.error}>Укажите причину</span>
      ) : null}
      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button type="submit" variant="ghost" disabled={busy || isSubmitting}>
          {isSubmitting ? 'Переносим…' : 'Перенести'}
        </Button>
      </div>
    </form>
  )
}
