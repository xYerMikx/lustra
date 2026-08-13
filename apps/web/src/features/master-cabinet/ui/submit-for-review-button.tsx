'use client'

import { useState } from 'react'
import type { MasterProfileView } from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'
import { publishMasterProfile } from '@/shared/api/master-profile-client'
import { Button } from '@/shared/ui/button'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

type SubmitForReviewButtonProps = {
  onPublished: (profile: MasterProfileView) => void
}

export function SubmitForReviewButton({
  onPublished,
}: SubmitForReviewButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setBusy(true)
    setError(null)

    try {
      const updated = await publishMasterProfile()
      onPublished(updated)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось отправить на проверку',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Button type="button" disabled={busy} onClick={() => void handleSubmit()}>
        {busy ? 'Отправляем…' : 'Отправить на проверку'}
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
