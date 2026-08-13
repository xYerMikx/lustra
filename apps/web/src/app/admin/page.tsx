import type { Metadata } from 'next'

import { RequireAdminSession } from '@/features/auth'
import { AdminMastersQueueShell } from '@/features/admin-moderation'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Админка',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <RequireAdminSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем доступ…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <AdminMastersQueueShell />
        </SiteChrome>
      </main>
    </RequireAdminSession>
  )
}
