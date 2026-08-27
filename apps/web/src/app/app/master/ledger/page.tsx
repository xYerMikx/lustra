import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterLedgerShell } from '@/features/master-ledger'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Финансы',
}

export default function MasterLedgerPage() {
  return (
    <RequireMasterSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <MasterLedgerShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
