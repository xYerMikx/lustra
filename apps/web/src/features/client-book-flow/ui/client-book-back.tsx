'use client'

import type { ClientBookStep } from '@/features/client-book-flow/model/types'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type ClientBookBackProps = {
  step: ClientBookStep
  onBackToMaster: () => void
  onBackToService: () => void
}

export function ClientBookBack({
  step,
  onBackToMaster,
  onBackToService,
}: ClientBookBackProps) {
  if (step === 'service') {
    return null
  }

  if (step === 'slot') {
    return (
      <button
        type="button"
        className={styles.back}
        data-testid={TEST_ID.clientBookBack}
        onClick={onBackToMaster}
      >
        Назад
      </button>
    )
  }

  return (
    <button
      type="button"
      className={styles.back}
      data-testid={TEST_ID.clientBookBack}
      onClick={onBackToService}
    >
      Назад
    </button>
  )
}
