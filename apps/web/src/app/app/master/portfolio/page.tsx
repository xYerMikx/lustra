import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterPortfolioShell } from '@/features/master-portfolio'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Портфолио',
}

export default function MasterPortfolioPage() {
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
          <MasterPortfolioShell />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
