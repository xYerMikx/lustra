'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { CreateExtraSlotInput } from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import { buildManualStartsAt } from '@/features/master-calendar/model/build-manual-starts-at'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { TEST_ID } from '@/shared/lib/test-id'

type ExtraSlotDialogProps = {
  defaultDate: string
  onClose: () => void
  onSubmit: (input: CreateExtraSlotInput) => Promise<void>
}

type ExtraSlotFormValues = {
  date: string
  startTime: string
  extraPayAmount: number
}

export function ExtraSlotDialog({
  defaultDate,
  onClose,
  onSubmit,
}: ExtraSlotDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ExtraSlotFormValues>({
    defaultValues: {
      date: defaultDate,
      startTime: '21:00',
      extraPayAmount: 15,
    },
  })

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)
    const startsAt = buildManualStartsAt(values.date, values.startTime)

    if (!startsAt) {
      setFormError('Проверьте дату и время')

      return
    }

    try {
      await onSubmit({
        startsAt,
        extraPayAmount: Number(values.extraPayAmount),
      })
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось добавить слот',
      )
    }
  })

  return (
    <Dialog
      title="Дополнительный слот"
      titleId="extra-slot-dialog-title"
      onClose={onClose}
      testId={TEST_ID.dialogExtraSlot}
    >
      <form className={formStyles.form} onSubmit={submitForm}>
        <p className={styles.label}>
          Окно вне обычного графика. Клиент увидит доплату.
        </p>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="extra-date">
            Дата
          </label>
          <input
            id="extra-date"
            type="date"
            className={styles.input}
            {...register('date', { required: true })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="extra-time">
            Начало
          </label>
          <input
            id="extra-time"
            type="time"
            className={styles.input}
            {...register('startTime', { required: true })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="extra-pay">
            Доплата, BYN
          </label>
          <input
            id="extra-pay"
            type="number"
            min={1}
            step={0.5}
            className={styles.input}
            {...register('extraPayAmount', { valueAsNumber: true, min: 1 })}
          />
        </div>
        {formError ? <p className={styles.fieldError}>{formError}</p> : null}
        <div className={styles.dialogActions}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем…' : 'Добавить'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
