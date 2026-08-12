import type { Metadata } from 'next'

import { RequireClientSession } from '@/features/auth'
import { ClientBookingsShell } from '@/features/booking-cabinets'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Мои записи',
}

export default function ClientBookingsPage() {
  return (
    <RequireClientSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome
          navItems={[
            { href: '/catalog', label: 'Каталог' },
            { href: '/app', label: 'Кабинет' },
            { href: '/app/client/bookings', label: 'Записи' },
          ]}
        >
          <ClientBookingsShell />
        </SiteChrome>
      </main>
    </RequireClientSession>
  )
}
