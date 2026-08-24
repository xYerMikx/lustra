import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterClientsShell } from '@/features/master-clients'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Клиенты',
}

export default function MasterClientsPage() {
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
          <MasterClientsShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
