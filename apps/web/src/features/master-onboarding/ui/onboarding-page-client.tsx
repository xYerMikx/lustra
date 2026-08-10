'use client'

import { useMasterSession } from '@/features/auth'
import { OnboardingShell } from '@/features/master-onboarding/ui/onboarding-shell'
import styles from '@/features/master-onboarding/ui/onboarding.module.css'
import { SiteChrome } from '@/shared/ui/site-chrome'

export function OnboardingPageClient() {
  const user = useMasterSession()

  return (
    <main className={styles.page}>
      <SiteChrome navItems={[{ href: '/catalog', label: 'Каталог' }]}>
        <OnboardingShell user={user} />
      </SiteChrome>
    </main>
  )
}
