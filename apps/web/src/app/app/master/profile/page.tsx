import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterProfileEditShell } from '@/features/master-profile-edit'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Профиль мастера',
}

export default function MasterProfilePage() {
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
          <MasterProfileEditShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
