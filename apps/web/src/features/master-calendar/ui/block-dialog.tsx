'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateTimeBlockInputSchema,
  type CreateTimeBlockInput,
} from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import { buildBlockIsoRange } from '@/features/master-calendar/model/build-block-iso-range'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ApiError } from '@/shared/api/http'
import { zonedLocalToUtc } from '@/shared/lib/tz'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { FormSelect } from '@/shared/ui/select'
import { TEST_ID } from '@/shared/lib/test-id'

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

export function BlockDialog({
  defaultDate,
  onClose,
  onSubmit,
}: BlockDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
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

    const range = buildBlockIsoRange({
      date: values.date,
      allDay: values.allDay,
      startTime: values.startTime,
      endTime: values.endTime,
    })

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
    <Dialog
      title="Блок времени"
      titleId="block-dialog-title"
      onClose={onClose}
      testId={TEST_ID.dialogBlock}
    >
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
            <FormSelect
              id="block-reason"
              control={control}
              name="reason"
              options={REASON_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
            {errors.reason ? (
              <span className={styles.fieldError}>{errors.reason.message}</span>
            ) : null}
          </div>

          {formError ? <p className={styles.fieldError}>{formError}</p> : null}

          <div className={styles.dialogActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid={TEST_ID.dialogBlockSubmit}
            >
              {isSubmitting ? 'Сохраняем…' : 'Заблокировать'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
    </Dialog>
  )
}
