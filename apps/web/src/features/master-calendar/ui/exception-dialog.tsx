'use client'

import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { PutScheduleExceptionInput } from '@lumira/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import {
  toExceptionInput,
  type ExceptionFormValues,
} from '@/features/master-calendar/model/to-exception-input'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
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
  { value: 'custom_hours', label: 'Свои окна / шаг' },
]

const STEP_OPTIONS: Array<{
  value: ExceptionFormValues['granularityMin']
  label: string
}> = [
  { value: '', label: 'Как в недельном графике' },
  { value: '15', label: '15 минут' },
  { value: '30', label: '30 минут' },
  { value: '60', label: '60 минут' },
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
      untilDate: '',
      type: 'day_off',
      startTime: '10:00',
      endTime: '20:00',
      extraWindows: [],
      granularityMin: '',
      note: '',
    },
  })
  const extraWindows = useFieldArray({ control, name: 'extraWindows' })
  const type = watch('type')

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)

    if (values.untilDate && values.untilDate < values.date) {
      setFormError('Конец периода не может быть раньше начала')

      return
    }

    const parsed = toExceptionInput(values)

    if (!parsed) {
      setFormError('Проверьте дату и интервалы')

      return
    }

    try {
      await onSubmit(values.date, parsed)
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Не удалось сохранить график',
      )
    }
  })

  return (
    <Dialog
      title="График на день или период"
      titleId="exception-dialog-title"
      onClose={onClose}
      testId={TEST_ID.dialogException}
    >
      <form className={formStyles.form} onSubmit={submitForm}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="exception-date">
            С даты
          </label>
          <input
            id="exception-date"
            type="date"
            className={styles.input}
            {...register('date', { required: true })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="exception-until">
            По дату (необязательно)
          </label>
          <input
            id="exception-until"
            type="date"
            className={styles.input}
            {...register('untilDate')}
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
              <label className={styles.label} htmlFor="exception-step">
                Шаг слотов
              </label>
              <FormSelect
                id="exception-step"
                control={control}
                name="granularityMin"
                options={STEP_OPTIONS}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="exception-start">
                Окно 1 · начало
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
                Окно 1 · конец
              </label>
              <input
                id="exception-end"
                type="time"
                className={styles.input}
                {...register('endTime', { required: true })}
              />
            </div>
            {extraWindows.fields.map((field, index) => (
              <div key={field.id} className={styles.field}>
                <label className={styles.label}>
                  Окно {index + 2}
                </label>
                <input
                  type="time"
                  className={styles.input}
                  {...register(`extraWindows.${index}.startTime` as const, {
                    required: true,
                  })}
                />
                <input
                  type="time"
                  className={styles.input}
                  {...register(`extraWindows.${index}.endTime` as const, {
                    required: true,
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => extraWindows.remove(index)}
                >
                  Убрать окно
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                extraWindows.append({ startTime: '14:00', endTime: '15:00' })
              }
            >
              Добавить окно
            </Button>
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
    </Dialog>
  )
}
