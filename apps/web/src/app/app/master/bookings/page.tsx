import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterBookingsShell } from '@/features/booking-cabinets'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Записи',
}

export default function MasterBookingsPage() {
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
          <MasterBookingsShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
