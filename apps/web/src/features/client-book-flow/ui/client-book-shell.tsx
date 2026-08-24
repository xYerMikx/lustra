'use client'

import { CLIENT_BOOK_STEP_TITLE } from '@/features/client-book-flow/model/client-book-copy'
import { useClientBookFlow } from '@/features/client-book-flow/model/use-client-book-flow'
import { ClientBookBack } from '@/features/client-book-flow/ui/client-book-back'
import { ClientBookBody } from '@/features/client-book-flow/ui/client-book-body'
import styles from '@/features/client-book-flow/ui/client-book-flow.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

export function ClientBookShell() {
  const flow = useClientBookFlow()

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageClientBook}>
      <header>
        <p className={styles.eyebrow}>Кабинет клиента</p>
        <h1 className={styles.title}>{CLIENT_BOOK_STEP_TITLE[flow.step]}</h1>
      </header>

      <ClientBookBack
        step={flow.step}
        onBackToMaster={flow.backToMaster}
        onBackToService={flow.backToService}
      />

      <ClientBookBody flow={flow} />
    </section>
  )
}
