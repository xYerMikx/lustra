'use client'

import { AppErrorScreen } from '@/features/app-error'
import styles from '@/shared/ui/site-chrome/site-chrome.module.css'

type AppErrorPageProps = {
  error: Error & { digest?: string }
}

export default function AppErrorPage({ error }: AppErrorPageProps) {
  return (
    <main className={styles.shell}>
      <AppErrorScreen error={error} />
    </main>
  )
}
