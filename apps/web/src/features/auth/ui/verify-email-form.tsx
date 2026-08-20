'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyEmailInputSchema, type VerifyEmailInput } from '@lustra/contracts'

import { clearSessionCache } from '@/features/auth/model/load-session'
import styles from '@/features/auth/ui/auth-form.module.css'
import { verifyEmail } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

const VERIFY_REDIRECT_DELAY_MS = 1000

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(VerifyEmailInputSchema),
    defaultValues: { token },
  })

  const submitForm = async (values: VerifyEmailInput) => {
    setFormError(null)

    try {
      await verifyEmail({ token: values.token })
      clearSessionCache()
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, VERIFY_REDIRECT_DELAY_MS)
      })
      router.replace('/app')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)

        return
      }

      setFormError('Не удалось подтвердить почту')
    }
  }

  if (!token) {
    return (
      <p className={styles.error} role="alert">
        Ссылка недействительна или устарела
      </p>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(submitForm)} noValidate>
      <input type="hidden" {...register('token')} />

      {formError ? (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" fullWidth loading={isSubmitting}>
        Подтвердить почту
      </Button>
    </form>
  )
}
