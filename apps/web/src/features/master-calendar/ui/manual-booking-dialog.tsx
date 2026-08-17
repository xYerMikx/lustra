'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  CreateManualBookingInputSchema,
  type CreateManualBookingInput,
  type MasterClientView,
  type ServiceView,
} from '@lustra/contracts'

import formStyles from '@/features/auth/ui/auth-form.module.css'
import {
  buildManualFormDefaults,
  type ManualFormValues,
} from '@/features/master-calendar/model/build-manual-form-defaults'
import { buildManualStartsAt } from '@/features/master-calendar/model/build-manual-starts-at'
import { MANUAL_CHANNEL_OPTIONS } from '@/features/master-calendar/model/channel-options'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { ClientSuggest } from '@/features/master-calendar/ui/client-suggest'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { FormSelect } from '@/shared/ui/select'
import { TEST_ID } from '@/shared/lib/test-id'

type ManualBookingDialogProps = {
  defaultDate: string
  defaultStartsAt: string | null
  services: ServiceView[]
  clients: MasterClientView[]
  onClose: () => void
  onSubmit: (input: CreateManualBookingInput) => Promise<void>
}

export function ManualBookingDialog({
  defaultDate,
  defaultStartsAt,
  services,
  clients,
  onClose,
  onSubmit,
}: ManualBookingDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ManualFormValues>({
    defaultValues: buildManualFormDefaults(defaultDate, defaultStartsAt, services),
  })

  const clientName = watch('clientName')

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)

    const startsAt = buildManualStartsAt(values.date, values.startTime)

    if (!startsAt) {
      setFormError('Проверьте дату и время')

      return
    }

    const parsed = CreateManualBookingInputSchema.safeParse({
      serviceId: values.serviceId,
      startsAt,
      clientName: values.clientName,
      phone: values.phone,
      channel: values.channel,
      note: values.note.trim() ? values.note.trim() : undefined,
    })

    if (!parsed.success) {
      setFormError('Проверьте имя, телефон и услугу')

      return
    }

    try {
      await onSubmit(parsed.data)
      onClose()
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Не удалось записать клиента',
      )
    }
  })

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-booking-title"
        data-testid={TEST_ID.dialogManual}
      >
        <h2 id="manual-booking-title" className={styles.dialogTitle}>
          Записать клиента
        </h2>
        <form className={formStyles.form} onSubmit={submitForm}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-service">
              Услуга
            </label>
            <FormSelect
              id="manual-service"
              control={control}
              name="serviceId"
              options={services.map((service) => ({
                value: service.id,
                label: service.title,
              }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-date">
              Дата
            </label>
            <input
              id="manual-date"
              type="date"
              className={styles.input}
              {...register('date', { required: true })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-time">
              Начало
            </label>
            <input
              id="manual-time"
              type="time"
              className={styles.input}
              {...register('startTime', { required: true })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-name">
              Имя
            </label>
            <ClientSuggest
              id="manual-name"
              value={clientName}
              clients={clients}
              testId={TEST_ID.dialogManualName}
              onChange={(name) => setValue('clientName', name, { shouldDirty: true })}
              onPick={(client) => {
                setValue('clientName', client.name, { shouldDirty: true })

                if (client.phone) {
                  setValue('phone', client.phone, { shouldDirty: true })
                }
              }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-phone">
              Телефон
            </label>
            <input
              id="manual-phone"
              className={styles.input}
              inputMode="tel"
              placeholder="+375291112233"
              data-testid={TEST_ID.dialogManualPhone}
              {...register('phone', { required: true })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-channel">
              Откуда запись
            </label>
            <FormSelect
              id="manual-channel"
              control={control}
              name="channel"
              options={MANUAL_CHANNEL_OPTIONS}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-note">
              Заметка
            </label>
            <input
              id="manual-note"
              className={styles.input}
              {...register('note')}
            />
          </div>

          {formError ? <p className={styles.fieldError}>{formError}</p> : null}

          <div className={styles.dialogActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid={TEST_ID.dialogManualSubmit}
            >
              {isSubmitting ? 'Сохраняем…' : 'Записать'}
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
