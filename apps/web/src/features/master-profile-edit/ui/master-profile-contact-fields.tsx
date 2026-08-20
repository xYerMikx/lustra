import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import type { EditMasterProfileFormValues } from '@/features/master-profile-edit/model/edit-profile-form-schema'
import { Field, TextInput } from '@/shared/ui/field'

type MasterProfileContactFieldsProps = {
  register: UseFormRegister<EditMasterProfileFormValues>
  errors: FieldErrors<EditMasterProfileFormValues>
}

export function MasterProfileContactFields({
  register,
  errors,
}: MasterProfileContactFieldsProps) {
  const publicPhoneRegister = register('publicPhone')
  const instagramRegister = register('instagram')
  const telegramRegister = register('telegramUsername')
  const websiteRegister = register('website')

  return (
    <>
      <Field
        label="Публичный телефон"
        htmlFor="profile-public-phone"
        error={errors.publicPhone?.message}
      >
        <TextInput
          id="profile-public-phone"
          type="tel"
          inputMode="tel"
          placeholder="+375291112233"
          autoComplete="tel"
          invalid={Boolean(errors.publicPhone)}
          {...publicPhoneRegister}
        />
      </Field>

      <Field
        label="Instagram"
        htmlFor="profile-instagram"
        error={errors.instagram?.message}
      >
        <TextInput
          id="profile-instagram"
          type="text"
          placeholder="anna.nails"
          autoComplete="off"
          spellCheck={false}
          invalid={Boolean(errors.instagram)}
          {...instagramRegister}
        />
      </Field>

      <Field
        label="Telegram"
        htmlFor="profile-telegram"
        error={errors.telegramUsername?.message}
      >
        <TextInput
          id="profile-telegram"
          type="text"
          placeholder="anna_nails"
          autoComplete="off"
          spellCheck={false}
          invalid={Boolean(errors.telegramUsername)}
          {...telegramRegister}
        />
      </Field>

      <Field
        label="Сайт"
        htmlFor="profile-website"
        error={errors.website?.message}
      >
        <TextInput
          id="profile-website"
          type="url"
          placeholder="https://"
          autoComplete="url"
          invalid={Boolean(errors.website)}
          {...websiteRegister}
        />
      </Field>
    </>
  )
}
