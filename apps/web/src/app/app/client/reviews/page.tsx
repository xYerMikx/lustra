import type { Metadata } from 'next'

import { RequireClientSession } from '@/features/auth'
import { ClientReviewsShell } from '@/features/reviews'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Отзывы',
}

export default function ClientReviewsPage() {
  return (
    <RequireClientSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <ClientReviewsShell />
        </SiteChrome>
      </main>
    </RequireClientSession>
  )
}
