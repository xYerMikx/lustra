'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoginInputSchema, type LoginInput } from '@lustra/contracts'

import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'
import { clearSessionCache } from '@/features/auth/model/load-session'
import styles from '@/features/auth/ui/auth-form.module.css'
import { login } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const submitForm = async (values: LoginInput) => {
    setFormError(null)

    try {
      const session = await login(values)

      if (!session) {
        setFormError('Не удалось войти')

        return
      }

      clearSessionCache()
      router.push(resolvePostAuthPath(session.user, nextPath))
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось войти')
    }
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

      <label className={styles.field}>
        <span>Пароль</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="current-password"
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
        {isSubmitting ? 'Входим…' : 'Войти'}
      </Button>
    </form>
  )
}
