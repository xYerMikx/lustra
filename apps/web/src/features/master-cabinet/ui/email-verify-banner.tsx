'use client'

import { useState } from 'react'

import { resendEmailVerify } from '@/shared/api/auth-client'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

export function EmailVerifyBanner() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const sendAgain = async () => {
    setBusy(true)
    setError(null)

    try {
      await resendEmailVerify()
      setSent(true)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось отправить письмо',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.verifyBanner}>
      <p className={styles.hint}>
        Подтвердите email — без этого профиль нельзя отправить на проверку.
      </p>
      {sent ? (
        <p className={styles.hint} role="status">
          Письмо отправлено. Проверьте почту.
        </p>
      ) : (
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void sendAgain()}>
          {busy ? 'Отправляем…' : 'Отправить письмо ещё раз'}
        </Button>
      )}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
