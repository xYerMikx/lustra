'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateTimeBlockInputSchema,
  type CreateTimeBlockInput,
} from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ApiError } from '@/shared/api/http'
import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/shared/lib/tz'
import { Button } from '@/shared/ui/button'

type BlockDialogProps = {
  defaultDate: string
  onClose: () => void
  onSubmit: (input: CreateTimeBlockInput) => Promise<void>
}

type BlockFormValues = CreateTimeBlockInput & {
  allDay: boolean
  date: string
  startTime: string
  endTime: string
}

const REASON_OPTIONS: Array<{
  value: CreateTimeBlockInput['reason']
  label: string
}> = [
  { value: 'lunch', label: 'Обед' },
  { value: 'break', label: 'Перерыв' },
  { value: 'personal', label: 'Личное' },
  { value: 'vacation', label: 'Выходной / отпуск' },
  { value: 'sick', label: 'Болезнь' },
  { value: 'travel', label: 'Поездка' },
  { value: 'other', label: 'Другое' },
]

function buildIsoRange(
  date: string,
  allDay: boolean,
  startTime: string,
  endTime: string,
): { startsAt: string; endsAt: string } {
  if (allDay) {
    return {
      startsAt: zonedLocalToUtc(date, 0, MASTER_TIMEZONE).toISOString(),
      endsAt: zonedLocalToUtc(
        addDaysToYmdDate(date, 1),
        0,
        MASTER_TIMEZONE,
      ).toISOString(),
    }
  }

  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  return {
    startsAt: zonedLocalToUtc(
      date,
      (startH ?? 0) * 60 + (startM ?? 0),
      MASTER_TIMEZONE,
    ).toISOString(),
    endsAt: zonedLocalToUtc(
      date,
      (endH ?? 0) * 60 + (endM ?? 0),
      MASTER_TIMEZONE,
    ).toISOString(),
  }
}

export function BlockDialog({
  defaultDate,
  onClose,
  onSubmit,
}: BlockDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<BlockFormValues>({
    defaultValues: {
      date: defaultDate,
      allDay: false,
      startTime: '13:00',
      endTime: '14:00',
      reason: 'lunch',
      startsAt: zonedLocalToUtc(defaultDate, 13 * 60).toISOString(),
      endsAt: zonedLocalToUtc(defaultDate, 14 * 60).toISOString(),
    },
  })

  const allDay = watch('allDay')

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)

    const range = buildIsoRange(
      values.date,
      values.allDay,
      values.startTime,
      values.endTime,
    )

    const parsed = CreateTimeBlockInputSchema.safeParse({
      startsAt: range.startsAt,
      endsAt: range.endsAt,
      reason: values.reason,
      note: values.note,
    })

    if (!parsed.success) {
      setFormError('Проверьте интервал блока')

      return
    }

    try {
      await onSubmit(parsed.data)
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Не удалось создать блок',
      )
    }
  })

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-dialog-title"
      >
        <h2 id="block-dialog-title" className={styles.dialogTitle}>
          Блок времени
        </h2>
        <form className={formStyles.form} onSubmit={submitForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="block-date">
              Дата
            </label>
            <input
              id="block-date"
              type="date"
              className={styles.input}
              {...register('date', { required: true })}
            />
          </div>

          <label className={styles.checkboxRow}>
            <input type="checkbox" {...register('allDay')} />
            Весь день (выходной)
          </label>

          {!allDay ? (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="block-start">
                  Начало
                </label>
                <input
                  id="block-start"
                  type="time"
                  className={styles.input}
                  {...register('startTime', { required: true })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="block-end">
                  Конец
                </label>
                <input
                  id="block-end"
                  type="time"
                  className={styles.input}
                  {...register('endTime', { required: true })}
                />
              </div>
            </>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="block-reason">
              Причина
            </label>
            <select
              id="block-reason"
              className={styles.select}
              {...register('reason')}
            >
              {REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.reason ? (
              <span className={styles.fieldError}>{errors.reason.message}</span>
            ) : null}
          </div>

          {formError ? <p className={styles.fieldError}>{formError}</p> : null}

          <div className={styles.dialogActions}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем…' : 'Заблокировать'}
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
