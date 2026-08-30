'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoginInputSchema, type LoginInput } from '@lumira/contracts'

import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'
import { clearSessionCache } from '@/features/auth/model/load-session'
import styles from '@/features/auth/ui/auth-form.module.css'
import { login } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { publicSiteUrl } from '@/shared/lib/public-site-url'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { PasswordInput } from '@/shared/ui/field'

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

  const site = publicSiteUrl()

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
          data-testid={TEST_ID.authLoginEmail}
          {...register('email')}
        />
        {errors.email ? (
          <span className={styles.fieldError}>{errors.email.message}</span>
        ) : null}
      </label>

      <label className={styles.field}>
        <span>Пароль</span>
        <PasswordInput
          autoComplete="current-password"
          data-testid={TEST_ID.authLoginPassword}
          invalid={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </label>

      <p className={styles.forgotRow}>
        <Link
          className={styles.forgotLink}
          href="/app/forgot"
          data-testid={TEST_ID.authForgotLink}
        >
          Забыли пароль?
        </Link>
      </p>

      {formError ? (
        <p className={styles.error} role="alert" data-testid={TEST_ID.authFormError}>
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting}
        data-testid={TEST_ID.authLoginSubmit}
      >
        {isSubmitting ? 'Входим…' : 'Войти'}
      </Button>
      <p className={styles.legalNote}>
        Входя, вы принимаете
        {' '}
        <a className={styles.checkLink} href={`${site}/terms`}>
          публичную оферту
        </a>
        {' '}
        и
        {' '}
        <a className={styles.checkLink} href={`${site}/privacy`}>
          политику конфиденциальности
        </a>
        .
      </p>
    </form>
  )
}
