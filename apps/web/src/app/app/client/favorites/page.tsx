import type { Metadata } from 'next'

import { RequireClientSession } from '@/features/auth'
import { FavoritesShell } from '@/features/favorites'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Избранное',
}

export default function ClientFavoritesPage() {
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
          <FavoritesShell />
        </SiteChrome>
      </main>
    </RequireClientSession>
  )
}
