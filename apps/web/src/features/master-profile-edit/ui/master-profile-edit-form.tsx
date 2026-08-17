'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import cn from 'classnames'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { DistrictView, MasterProfileView } from '@lustra/contracts'

import { LOCATION_TYPE_OPTIONS } from '@/features/master-onboarding/model/step-basics-draft'
import { buildEditProfileDefaults } from '@/features/master-profile-edit/model/build-edit-profile-defaults'
import {
  EditMasterProfileFormSchema,
  type EditMasterProfileFormValues,
} from '@/features/master-profile-edit/model/edit-profile-form-schema'
import { toPatchMasterProfileInput } from '@/features/master-profile-edit/model/to-patch-input'
import {
  slugAvailabilityCopy,
  useSlugAvailability,
} from '@/features/master-profile-edit/model/use-slug-availability'
import { MasterProfileContactFields } from '@/features/master-profile-edit/ui/master-profile-contact-fields'
import styles from '@/features/master-profile-edit/ui/master-profile-edit.module.css'
import { ApiError } from '@/shared/api/http'
import { patchMasterProfile } from '@/shared/api/master-profile-client'
import { Button, ButtonLink } from '@/shared/ui/button'
import { Field, TextArea, TextInput } from '@/shared/ui/field'
import { FormSelect } from '@/shared/ui/select'

type MasterProfileEditFormProps = {
  profile: MasterProfileView
  districts: DistrictView[]
  onProfileSaved: (profile: MasterProfileView) => void
}

export function MasterProfileEditForm({
  profile,
  districts,
  onProfileSaved,
}: MasterProfileEditFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<EditMasterProfileFormValues>({
    resolver: zodResolver(EditMasterProfileFormSchema),
    defaultValues: buildEditProfileDefaults(profile, districts),
  })

  const slugValue = watch('slug')
  const slugState = useSlugAvailability(
    slugValue,
    profile.slug,
    setError,
    clearErrors,
  )

  const displayNameRegister = register('displayName')
  const slugRegister = register('slug')
  const headlineRegister = register('headline')
  const bioRegister = register('bio')
  const addressHintRegister = register('addressHint')
  const locationTypeRegister = register('locationType')

  const submitForm = async (data: EditMasterProfileFormValues) => {
    setFormError(null)
    setSaved(false)

    if (slugState.kind === 'taken') {
      setError('slug', {
        type: 'manual',
        message: 'Этот адрес уже занят',
      })

      return
    }

    try {
      const updated = await patchMasterProfile(toPatchMasterProfileInput(data))
      onProfileSaved(updated)
      setSaved(true)
      router.refresh()
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
        htmlFor="profile-display-name"
        error={errors.displayName?.message}
      >
        <TextInput
          id="profile-display-name"
          type="text"
          autoComplete="organization"
          invalid={Boolean(errors.displayName)}
          {...displayNameRegister}
        />
      </Field>

      <Field
        label="Ссылка профиля"
        htmlFor="profile-slug"
        error={errors.slug?.message}
      >
        <TextInput
          id="profile-slug"
          type="text"
          autoComplete="off"
          spellCheck={false}
          invalid={Boolean(errors.slug) || slugState.kind === 'taken'}
          {...slugRegister}
        />
        <p
          className={cn(
            styles.slugHint,
            slugState.kind === 'available' && styles.slugOk,
            slugState.kind === 'taken' && styles.slugBusy,
          )}
        >
          {slugAvailabilityCopy(slugState, slugValue)}
        </p>
      </Field>

      <Field
        label="Район"
        htmlFor="profile-district"
        error={errors.districtId?.message}
      >
        <FormSelect
          id="profile-district"
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
        label="Адрес (подсказка)"
        htmlFor="profile-address-hint"
        error={errors.addressHint?.message}
      >
        <TextInput
          id="profile-address-hint"
          type="text"
          placeholder="Рядом с метро, ориентир"
          invalid={Boolean(errors.addressHint)}
          {...addressHintRegister}
        />
      </Field>

      <Field
        label="Короткий заголовок"
        htmlFor="profile-headline"
        error={errors.headline?.message}
      >
        <TextInput
          id="profile-headline"
          type="text"
          maxLength={120}
          invalid={Boolean(errors.headline)}
          {...headlineRegister}
        />
      </Field>

      <Field label="О себе" htmlFor="profile-bio" error={errors.bio?.message}>
        <TextArea
          id="profile-bio"
          maxLength={1000}
          invalid={Boolean(errors.bio)}
          {...bioRegister}
        />
      </Field>

      <MasterProfileContactFields register={register} errors={errors} />

      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}

      {saved ? (
        <p className={styles.success} role="status">
          Сохранено
        </p>
      ) : null}

      <div className={styles.actions}>
        <ButtonLink href="/app" variant="ghost">
          Назад
        </ButtonLink>
        <Button
          type="submit"
          className={styles.actionsGrow}
          disabled={isSubmitting || slugState.kind === 'checking'}
        >
          {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
        </Button>
      </div>
    </form>
  )
}
