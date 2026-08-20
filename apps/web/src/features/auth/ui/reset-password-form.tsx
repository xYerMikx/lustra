'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ResetPasswordInputSchema, type ResetPasswordInput } from '@lustra/contracts'

import styles from '@/features/auth/ui/auth-form.module.css'
import { resetPassword } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { PasswordInput } from '@/shared/ui/field'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordInputSchema),
    defaultValues: {
      token,
      password: '',
    },
  })

  const submitForm = async (values: ResetPasswordInput) => {
    setFormError(null)

    try {
      await resetPassword({ token, password: values.password })
      setDone(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось обновить пароль')
    }
  }

  if (!token) {
    return (
      <p
        className={styles.error}
        role="alert"
        data-testid={TEST_ID.authResetInvalid}
      >
        Ссылка недействительна или устарела
      </p>
    )
  }

  if (done) {
    return (
      <p
        className={styles.success}
        role="status"
        data-testid={TEST_ID.authResetDone}
      >
        Пароль обновлён.{' '}
        <Link
          className={styles.inlineLink}
          href="/app/login"
          data-testid={TEST_ID.authResetLoginLink}
        >
          Войти
        </Link>
      </p>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <input type="hidden" {...register('token')} />
      <label className={styles.field}>
        <span>Новый пароль</span>
        <PasswordInput
          autoComplete="new-password"
          data-testid={TEST_ID.authResetPassword}
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </label>

      {formError ? (
        <p className={styles.error} role="alert" data-testid={TEST_ID.authFormError}>
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting}
        data-testid={TEST_ID.authResetSubmit}
      >
        {isSubmitting ? 'Сохраняем…' : 'Сохранить пароль'}
      </Button>
    </form>
  )
}
