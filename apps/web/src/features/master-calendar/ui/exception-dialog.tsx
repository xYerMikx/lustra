'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { PutScheduleExceptionInput } from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import {
  toExceptionInput,
  type ExceptionFormValues,
} from '@/features/master-calendar/model/to-exception-input'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { FormSelect } from '@/shared/ui/select'
import { TEST_ID } from '@/shared/lib/test-id'

type ExceptionDialogProps = {
  defaultDate: string
  onClose: () => void
  onSubmit: (date: string, input: PutScheduleExceptionInput) => Promise<void>
}

const TYPE_OPTIONS: Array<{
  value: ExceptionFormValues['type']
  label: string
}> = [
  { value: 'day_off', label: 'Выходной' },
  { value: 'custom_hours', label: 'Особые часы' },
]

export function ExceptionDialog({
  defaultDate,
  onClose,
  onSubmit,
}: ExceptionDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ExceptionFormValues>({
    defaultValues: {
      date: defaultDate,
      type: 'day_off',
      startTime: '10:00',
      endTime: '18:00',
      note: '',
    },
  })

  const type = watch('type')

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)

    const parsed = toExceptionInput(values)

    if (!parsed) {
      setFormError('Проверьте дату и интервал')

      return
    }

    try {
      await onSubmit(values.date, parsed)
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось сохранить исключение',
      )
    }
  })

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exception-dialog-title"
        data-testid={TEST_ID.dialogException}
      >
        <h2 id="exception-dialog-title" className={styles.dialogTitle}>
          Исключение в графике
        </h2>
        <form className={formStyles.form} onSubmit={submitForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="exception-date">
              Дата
            </label>
            <input
              id="exception-date"
              type="date"
              className={styles.input}
              {...register('date', { required: true })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="exception-type">
              Тип
            </label>
            <FormSelect
              id="exception-type"
              control={control}
              name="type"
              options={TYPE_OPTIONS}
            />
          </div>

          {type === 'custom_hours' ? (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="exception-start">
                  Начало
                </label>
                <input
                  id="exception-start"
                  type="time"
                  className={styles.input}
                  {...register('startTime', { required: true })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="exception-end">
                  Конец
                </label>
                <input
                  id="exception-end"
                  type="time"
                  className={styles.input}
                  {...register('endTime', { required: true })}
                />
              </div>
            </>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="exception-note">
              Заметка
            </label>
            <input
              id="exception-note"
              type="text"
              className={styles.input}
              maxLength={500}
              {...register('note')}
            />
          </div>

          {formError ? <p className={styles.fieldError}>{formError}</p> : null}

          <div className={styles.dialogActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid={TEST_ID.dialogExceptionSubmit}
            >
              {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
