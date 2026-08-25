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
} from '@/features/manual-booking/model/build-manual-form-defaults'
import { buildManualStartsAt } from '@/features/manual-booking/model/build-manual-starts-at'
import { IDENTITY_NETWORK_OPTIONS, MANUAL_CHANNEL_OPTIONS } from '@/features/manual-booking/model/channel-options'
import styles from '@/features/manual-booking/ui/manual-booking.module.css'
import { ClientSuggest } from '@/features/manual-booking/ui/client-suggest'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
import { FormSelect } from '@/shared/ui/select'
import { TEST_ID } from '@/shared/lib/test-id'

type ManualBookingDialogProps = {
  defaultDate: string
  defaultStartsAt: string | null
  minDate: string
  services: ServiceView[]
  clients: MasterClientView[]
  prefillClient?: MasterClientView | null
  onClose: () => void
  onSubmit: (input: CreateManualBookingInput) => Promise<void>
}

export function ManualBookingDialog({
  defaultDate,
  defaultStartsAt,
  minDate,
  services,
  clients,
  prefillClient = null,
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
    defaultValues: buildManualFormDefaults(
      defaultDate,
      defaultStartsAt,
      services,
      prefillClient
        ? {
            name: prefillClient.name,
            phone: prefillClient.phone,
            socialHandle: prefillClient.socialHandle,
            source: prefillClient.source,
          }
        : null,
    ),
  })

  const clientName = watch('clientName')
  const channel = watch('channel')
  const identityNetwork = watch('identityNetwork')
  const handleNetwork =
    channel === 'instagram' || channel === 'telegram' ? channel : identityNetwork
  const showIdentityNetwork =
    channel !== 'instagram' && channel !== 'telegram'

  const submitForm = handleSubmit(async (values) => {
    setFormError(null)

    const startsAt = buildManualStartsAt(values.date, values.startTime)

    if (!startsAt) {
      setFormError('Проверьте дату и время')

      return
    }

    if (values.date < minDate) {
      setFormError('Нельзя записать клиента на прошедшую дату')

      return
    }

    const parsed = CreateManualBookingInputSchema.safeParse({
      serviceId: values.serviceId,
      startsAt,
      clientName: values.clientName,
      phone: values.phone,
      channel: values.channel,
      identityNetwork:
        values.channel === 'instagram' || values.channel === 'telegram'
          ? values.channel
          : values.identityNetwork,
      socialHandle: values.socialHandle.trim()
        ? values.socialHandle.trim()
        : undefined,
      note: values.note.trim() ? values.note.trim() : undefined,
    })

    if (!parsed.success) {
      setFormError('Проверьте имя, контакты и услугу')

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
    <Dialog
      title="Записать клиента"
      titleId="manual-booking-title"
      onClose={onClose}
      testId={TEST_ID.dialogManual}
    >
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
              min={minDate}
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

                setValue('socialHandle', client.socialHandle ?? '', {
                  shouldDirty: true,
                })

                if (client.source === 'instagram' || client.source === 'telegram') {
                  setValue('channel', client.source, { shouldDirty: true })
                  setValue('identityNetwork', client.source, { shouldDirty: true })
                }
              }}
            />
          </div>

          {showIdentityNetwork ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="manual-identity">
                Ник в
              </label>
              <FormSelect
                id="manual-identity"
                control={control}
                name="identityNetwork"
                options={IDENTITY_NETWORK_OPTIONS}
              />
            </div>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-handle">
              {handleNetwork === 'telegram' ? 'Ник в Telegram' : 'Ник в Instagram'}
            </label>
            <input
              id="manual-handle"
              className={styles.input}
              placeholder="@username"
              autoComplete="off"
              required
              data-testid={TEST_ID.dialogManualHandle}
              {...register('socialHandle', { required: true })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="manual-phone">
              Телефон (необязательно)
            </label>
            <input
              id="manual-phone"
              className={styles.input}
              inputMode="tel"
              placeholder="+375291112233"
              data-testid={TEST_ID.dialogManualPhone}
              {...register('phone')}
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
    </Dialog>
  )
}
