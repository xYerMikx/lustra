'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  StepBasicsInputSchema,
  type DistrictView,
  type MasterProfileView,
  type PatchMasterProfileInput,
  type StepBasicsInput,
} from '@lustra/contracts'

import {
  LOCATION_TYPE_OPTIONS,
  readStepBasicsDraft,
  writeStepBasicsDraft,
} from '@/features/master-onboarding/model/step-basics-draft'
import formStyles from '@/features/auth/ui/auth-form.module.css'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

type StepBasicsFormProps = {
  profile: MasterProfileView
  districts: DistrictView[]
  userFirstName: string
  onSave: (input: PatchMasterProfileInput) => Promise<MasterProfileView>
}

function buildDefaultValues(
  profile: MasterProfileView,
  userFirstName: string,
  districts: DistrictView[],
): StepBasicsInput {
  const stored = readStepBasicsDraft()

  if (stored) {
    return {
      displayName: stored.displayName,
      districtId: stored.districtId || districts[0]?.id || '',
      locationType: stored.locationType,
      headline: stored.headline,
    }
  }

  return {
    displayName: profile.displayName || userFirstName,
    districtId: profile.primaryLocation?.districtId ?? districts[0]?.id ?? '',
    locationType: profile.primaryLocation?.type ?? 'salon',
    headline: profile.headline ?? '',
  }
}

export function StepBasicsForm({
  profile,
  districts,
  userFirstName,
  onSave,
}: StepBasicsFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StepBasicsInput>({
    resolver: zodResolver(StepBasicsInputSchema),
    defaultValues: buildDefaultValues(profile, userFirstName, districts),
  })

  const values = watch()

  useEffect(() => {
    if (!values.districtId) {
      return
    }

    writeStepBasicsDraft({
      displayName: values.displayName,
      districtId: values.districtId,
      locationType: values.locationType,
      headline: values.headline,
    })
  }, [values])

  const submitForm = async (data: StepBasicsInput) => {
    setFormError(null)

    try {
      await onSave({
        displayName: data.displayName,
        districtId: data.districtId,
        locationType: data.locationType,
        headline: data.headline.length > 0 ? data.headline : null,
      })
      router.push('/app')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось сохранить профиль')
    }
  }

  return (
    <form className={formStyles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <label className={formStyles.field}>
        <span>Имя или бренд</span>
        <input
          type="text"
          autoComplete="organization"
          {...register('displayName')}
        />
        {errors.displayName ? (
          <span className={formStyles.fieldError}>{errors.displayName.message}</span>
        ) : null}
      </label>

      <label className={formStyles.field}>
        <span>Район</span>
        <select className={styles.select} {...register('districtId')}>
          <option value="" disabled>
            Выберите район
          </option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
        {errors.districtId ? (
          <span className={formStyles.fieldError}>{errors.districtId.message}</span>
        ) : null}
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Формат работы</legend>
        <Controller
          name="locationType"
          control={control}
          render={({ field }) => (
            <div className={styles.radioGroup}>
              {LOCATION_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className={styles.radioOption}>
                  <input
                    className={styles.radioInput}
                    type="radio"
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={() => field.onChange(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.locationType ? (
          <span className={formStyles.fieldError}>{errors.locationType.message}</span>
        ) : null}
      </fieldset>

      <label className={formStyles.field}>
        <span>Короткий заголовок</span>
        <input
          type="text"
          placeholder="Мастер маникюра, 5 лет опыта"
          maxLength={120}
          {...register('headline')}
        />
        {errors.headline ? (
          <span className={formStyles.fieldError}>{errors.headline.message}</span>
        ) : null}
      </label>

      {formError ? (
        <p className={formStyles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting || !values.districtId} fullWidth>
        {isSubmitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
      </Button>
    </form>
  )
}
