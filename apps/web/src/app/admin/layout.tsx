import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { RequireAdminSession } from '@/features/auth'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Админка',
  robots: { index: false, follow: false },
}

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <RequireAdminSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем доступ…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>{children}</SiteChrome>
      </main>
    </RequireAdminSession>
  )
}
