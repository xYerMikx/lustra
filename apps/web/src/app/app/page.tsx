import type { Metadata } from 'next'

import { RequireSession } from '@/features/auth'
import { CabinetHomePanel } from '@/features/booking-cabinets'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from './app.module.css'

export const metadata: Metadata = {
  title: 'Кабинет',
}

export default function CabinetPage() {
  return (
    <RequireSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <CabinetHomePanel />
        </SiteChrome>
      </main>
    </RequireSession>
  )
}
