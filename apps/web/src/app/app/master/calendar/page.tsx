import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { CalendarShell } from '@/features/master-calendar'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Календарь',
}

export default function MasterCalendarPage() {
  return (
    <RequireMasterSession
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
            { href: '/app/master/calendar', label: 'Календарь' },
          ]}
        >
          <CalendarShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
