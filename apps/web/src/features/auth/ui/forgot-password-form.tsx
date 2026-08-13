'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ForgotPasswordInputSchema, type ForgotPasswordInput } from '@lustra/contracts'

import styles from '@/features/auth/ui/auth-form.module.css'
import { requestPasswordReset } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordInputSchema),
    defaultValues: {
      email: '',
    },
  })

  const submitForm = async (values: ForgotPasswordInput) => {
    setFormError(null)

    try {
      await requestPasswordReset(values)
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось отправить письмо')
    }
  }

  if (sent) {

    return (
      <p className={styles.success} role="status">
        Если аккаунт есть, мы отправили письмо.
      </p>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <label className={styles.field}>
        <span>Email</span>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email ? (
          <span className={styles.fieldError}>{errors.email.message}</span>
        ) : null}
      </label>

      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Отправляем…' : 'Отправить ссылку'}
      </Button>
    </form>
  )
}
