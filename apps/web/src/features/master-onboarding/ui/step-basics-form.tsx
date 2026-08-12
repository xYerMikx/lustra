'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  StepBasicsInputSchema,
  type DistrictView,
  type MasterProfileView,
  type PatchMasterProfileInput,
  type StepBasicsInput,
} from '@lustra/contracts'

import { buildStepBasicsDefaultValues } from '@/features/master-onboarding/model/build-step-basics-defaults'
import {
  LOCATION_TYPE_OPTIONS,
  writeStepBasicsDraft,
} from '@/features/master-onboarding/model/step-basics-draft'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import { Field, TextInput } from '@/shared/ui/field'
import { FormSelect } from '@/shared/ui/select'

type StepBasicsFormProps = {
  profile: MasterProfileView
  districts: DistrictView[]
  userFirstName: string
  onSave: (input: PatchMasterProfileInput) => Promise<MasterProfileView>
  onSkip: () => void
}

export function StepBasicsForm({
  profile,
  districts,
  userFirstName,
  onSave,
  onSkip,
}: StepBasicsFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StepBasicsInput>({
    resolver: zodResolver(StepBasicsInputSchema),
    defaultValues: buildStepBasicsDefaultValues(profile, userFirstName, districts),
  })

  const values = watch()
  const displayNameRegister = register('displayName')
  const headlineRegister = register('headline')
  const locationTypeRegister = register('locationType')

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
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось сохранить профиль')
    }
  }

  const districtOptions = districts.map((district) => ({
    value: district.id,
    label: district.name,
  }))

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      <Field
        label="Имя или бренд"
        htmlFor="onboarding-display-name"
        error={errors.displayName?.message}
      >
        <TextInput
          id="onboarding-display-name"
          type="text"
          autoComplete="organization"
          invalid={Boolean(errors.displayName)}
          {...displayNameRegister}
        />
      </Field>

      <Field
        label="Район"
        htmlFor="onboarding-district"
        error={errors.districtId?.message}
      >
        <FormSelect
          id="onboarding-district"
          control={control}
          name="districtId"
          options={districtOptions}
          placeholder="Выберите район"
        />
      </Field>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Формат работы</legend>
        <div className={styles.radioGroup}>
          {LOCATION_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className={styles.radioOption}>
              <input
                className={styles.radioInput}
                type="radio"
                value={option.value}
                {...locationTypeRegister}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.locationType ? (
          <span className={styles.fieldError}>{errors.locationType.message}</span>
        ) : null}
      </fieldset>

      <Field
        label="Короткий заголовок"
        htmlFor="onboarding-headline"
        error={errors.headline?.message}
      >
        <TextInput
          id="onboarding-headline"
          type="text"
          placeholder="Мастер маникюра, 5 лет опыта"
          maxLength={120}
          invalid={Boolean(errors.headline)}
          {...headlineRegister}
        />
      </Field>

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isSubmitting}
        >
          Пропустить
        </Button>
        <Button
          type="submit"
          className={styles.actionsGrow}
          disabled={isSubmitting || !values.districtId}
        >
          {isSubmitting ? 'Сохраняем…' : 'Сохранить и продолжить'}
        </Button>
      </div>
    </form>
  )
}
