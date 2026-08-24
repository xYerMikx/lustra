import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { OnboardingPageClient } from '@/features/master-onboarding'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'

export const metadata: Metadata = {
  title: 'Первые шаги',
}

export default function MasterOnboardingPage() {
  return (
    <RequireMasterSession
      fallback={
        <main className={styles.page}>
          <p className={styles.fallbackCopy}>Проверяем сессию…</p>
        </main>
      }
    >
      <OnboardingPageClient />
    </RequireMasterSession>
  )
}
