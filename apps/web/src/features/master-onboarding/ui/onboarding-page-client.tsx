'use client'

import Link from 'next/link'
import type { MeResponse } from '@lustra/contracts'

import { OnboardingShell } from './onboarding-shell'
import styles from './onboarding.module.css'

type OnboardingPageClientProps = {
  user: MeResponse
}

export function OnboardingPageClient({ user }: OnboardingPageClientProps) {
  return (
    <main className={styles.page}>
      <div className="shell">
        <header className="site-header">
          <Link href="/" className="brand">
            Lustra
          </Link>
          <nav className="nav" aria-label="Основная навигация">
            <Link href="/catalog">Каталог</Link>
          </nav>
        </header>

        <OnboardingShell user={user} />
      </div>
    </main>
  )
}
