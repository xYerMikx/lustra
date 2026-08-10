'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  RegisterInputSchema,
  type RegisterInput,
  type RegisterRole,
} from '@lustra/contracts'

import { resolvePostAuthPath } from '@/features/auth/lib/resolve-post-auth-path'
import styles from '@/features/auth/ui/auth-form.module.css'
import { RoleSegment } from '@/features/auth/ui/role-segment'
import { register as registerAccount } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

const REGISTER_INTRO: Record<RegisterRole, string> = {
  client: 'Аккаунт для записи к мастерам.',
  master: 'Профиль мастера — дальше настроите услуги и расписание.',
}

export function RegisterForm() {
  const router = useRouter()
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
      role: 'client',
      acceptTerms: false,
    },
  })

  const role = watch('role')

  const submitForm = async (values: RegisterInput) => {
    setFormError(null)

    try {
      const session = await registerAccount(values)

      if (!session) {
        setFormError('Не удалось зарегистрироваться')

        return
      }

      router.push(resolvePostAuthPath(session.user))
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
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password ? (
            <span className={styles.fieldError}>{errors.password.message}</span>
          ) : null}
        </label>

        <label className={styles.check}>
          <input type="checkbox" {...register('acceptTerms')} />
          <span>Принимаю условия использования и политику конфиденциальности</span>
        </label>
        {errors.acceptTerms ? (
          <span className={styles.fieldError}>{errors.acceptTerms.message}</span>
        ) : null}

        {formError ? (
          <p className={styles.error} role="alert">
            {formError}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Создаём…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </>
  )
}
