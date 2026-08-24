import type { Metadata } from 'next'

import { RequireClientSession } from '@/features/auth'
import { ClientBookShell } from '@/features/client-book-flow'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Записаться',
}

export default function ClientBookPage() {
  return (
    <RequireClientSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <ClientBookShell />
        </SiteChrome>
      </main>
    </RequireClientSession>
  )
}
