import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { OnboardingPageClient } from '@/features/master-onboarding'

export const metadata: Metadata = {
  title: 'Онбординг мастера',
}

export default function MasterOnboardingPage() {
  return (
    <RequireMasterSession
      fallback={
        <main style={{ padding: '48px 16px', textAlign: 'center' }}>
          <p>Проверяем сессию…</p>
        </main>
      }
    >
      {(user) => <OnboardingPageClient user={user} />}
    </RequireMasterSession>
  )
}
