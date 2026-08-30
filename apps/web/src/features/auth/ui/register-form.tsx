'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  RegisterInputSchema,
  type RegisterInput,
  type RegisterRole,
} from '@lumira/contracts'

import { parseRegisterRole } from '@/features/auth/lib/parse-register-role'
import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'
import { clearSessionCache } from '@/features/auth/model/load-session'
import styles from '@/features/auth/ui/auth-form.module.css'
import { RoleSegment } from '@/features/auth/ui/role-segment'
import { register as registerAccount } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { publicSiteUrl } from '@/shared/lib/public-site-url'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { PasswordInput } from '@/shared/ui/field'

const REGISTER_INTRO: Record<RegisterRole, string> = {
  client: 'Аккаунт для записи к мастерам.',
  master: 'Профиль мастера — дальше настроите услуги и расписание.',
}

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')
  const initialRole = parseRegisterRole(searchParams.get('role'))
  const [formError, setFormError] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
      role: initialRole,
      acceptTerms: false,
    },
  })

  const role = watch('role')
  const site = publicSiteUrl()

  const submitForm = async (values: RegisterInput) => {
    setFormError(null)

    try {
      const session = await registerAccount(values)

      if (!session) {
        setFormError('Не удалось зарегистрироваться')

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

      setFormError('Не удалось зарегистрироваться')
    }
  }

  return (
    <>
      <p className={styles.intro}>{REGISTER_INTRO[role]}</p>
      <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
        <div className={styles.roleField}>
          <span className={styles.roleLabel}>Я регистрируюсь как</span>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSegment value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <label className={styles.field}>
          <span>Имя</span>
          <input
            className={styles.input}
            type="text"
            autoComplete="given-name"
            data-testid={TEST_ID.authRegisterName}
            {...register('firstName')}
          />
          {errors.firstName ? (
            <span className={styles.fieldError}>{errors.firstName.message}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Email</span>
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            data-testid={TEST_ID.authRegisterEmail}
            {...register('email')}
          />
          {errors.email ? (
            <span className={styles.fieldError}>{errors.email.message}</span>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>Пароль</span>
          <PasswordInput
            autoComplete="new-password"
            data-testid={TEST_ID.authRegisterPassword}
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password ? (
            <span
              className={styles.fieldError}
              data-testid={TEST_ID.authRegisterPasswordError}
            >
              {errors.password.message}
            </span>
          ) : null}
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            data-testid={TEST_ID.authRegisterTerms}
            {...register('acceptTerms')}
          />
          <span>Принимаю публичную оферту и политику конфиденциальности</span>
        </label>
        {errors.acceptTerms ? (
          <span className={styles.fieldError}>{errors.acceptTerms.message}</span>
        ) : null}
        <p className={styles.legalNote}>
          <a className={styles.checkLink} href={`${site}/terms`}>
            Публичная оферта
          </a>
          {' · '}
          <a className={styles.checkLink} href={`${site}/privacy`}>
            Политика конфиденциальности
          </a>
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
          data-testid={TEST_ID.authRegisterSubmit}
        >
          {isSubmitting ? 'Создаём…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </>
  )
}
