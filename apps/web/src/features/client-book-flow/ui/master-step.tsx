'use client'

import type { BookMasterCandidate } from '@/features/client-book-flow/model/types'
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
  return (
    <div className={styles.section} data-testid={TEST_ID.clientBookMasterStep}>
      <p className={styles.copy}>Мастера для услуги «{serviceTitle}»</p>

      {status === 'loading' || status === 'idle' ? (
        <p className={styles.message}>Ищем мастеров…</p>
      ) : null}

      {status === 'error' ? (
        <div>
          <p className={styles.error}>{errorMessage}</p>
          <Button type="button" variant="ghost" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      ) : null}

      {pickError ? <p className={styles.error}>{pickError}</p> : null}

      {status === 'success' && masters.length === 0 ? (
        <p className={styles.empty}>
          Пока нет мастеров с этой услугой. Выберите другую или откройте каталог.
        </p>
      ) : null}

      {status === 'success' && masters.length > 0 ? (
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
      ) : null}
    </div>
  )
}
