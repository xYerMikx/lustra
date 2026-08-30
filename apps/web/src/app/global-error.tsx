'use client'

import { AppErrorScreen } from '@/features/app-error'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

import './globals.css'

type GlobalErrorPageProps = {
  error: Error & { digest?: string }
}

export default function GlobalErrorPage({ error }: GlobalErrorPageProps) {
  return (
    <html lang="ru-BY">
      <body>
        <main className={styles.shell}>
          <AppErrorScreen error={error} />
        </main>
      </body>
    </html>
  )
}
