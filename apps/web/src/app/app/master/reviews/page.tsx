import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterReviewsShell } from '@/features/reviews'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Отзывы',
}

export default function MasterReviewsPage() {
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
          <MasterReviewsShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
