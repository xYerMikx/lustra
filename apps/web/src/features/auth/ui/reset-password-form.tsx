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
import { Button } from '@/shared/ui/button'

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
      <p className={styles.error} role="alert">
        Ссылка недействительна или устарела
      </p>
    )
  }

  if (done) {
    return (
      <p className={styles.success} role="status">
        Пароль обновлён.{' '}
        <Link className={styles.inlineLink} href="/app/login">
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
        <input
          className={styles.input}
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </label>

      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Сохраняем…' : 'Сохранить пароль'}
      </Button>
    </form>
  )
}
