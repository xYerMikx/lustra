import { Suspense } from 'react'
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
        <SiteChrome>
          <Suspense fallback={<p className={styles.copy}>Загружаем календарь…</p>}>
            <CalendarShell />
          </Suspense>
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
