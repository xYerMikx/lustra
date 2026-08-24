'use client'

import type { BookMasterCandidate } from '@/features/client-book-flow/model/types'
import { CLIENT_BOOK_COPY } from '@/features/client-book-flow/model/client-book-copy'
import { MasterPickCard } from '@/features/client-book-flow/ui/master-pick-card'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterStepProps = {
  serviceTitle: string
  masters: BookMasterCandidate[]
  status: 'idle' | 'loading' | 'error' | 'success'
  errorMessage: string | null
  busy: boolean
  pickError: string | null
  onSelect: (master: BookMasterCandidate) => void
  onRetry: () => void
}

export function MasterStep({
  serviceTitle,
  masters,
  status,
  errorMessage,
  busy,
  pickError,
  onSelect,
  onRetry,
}: MasterStepProps) {
  if (status === 'error') {
    return (
      <div className={styles.section} data-testid={TEST_ID.clientBookMasterStep}>
        <p className={styles.copy}>Мастера для услуги «{serviceTitle}»</p>
        <div>
          <p className={styles.error}>{errorMessage}</p>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className={styles.section} data-testid={TEST_ID.clientBookMasterStep}>
        <p className={styles.copy}>Мастера для услуги «{serviceTitle}»</p>
        <p className={styles.message}>{CLIENT_BOOK_COPY.masterLoading}</p>
      </div>
    )
  }

  if (masters.length === 0) {
    return (
      <div className={styles.section} data-testid={TEST_ID.clientBookMasterStep}>
        <p className={styles.copy}>Мастера для услуги «{serviceTitle}»</p>
        <p className={styles.empty}>{CLIENT_BOOK_COPY.masterEmpty}</p>
      </div>
    )
  }

  return (
    <div className={styles.section} data-testid={TEST_ID.clientBookMasterStep}>
      <p className={styles.copy}>Мастера для услуги «{serviceTitle}»</p>
      {pickError ? <p className={styles.error}>{pickError}</p> : null}
      <ul className={styles.masterList}>
        {masters.map((master) => (
          <li key={master.id}>
            <MasterPickCard
              master={master}
              disabled={busy}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
