import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { ResetPasswordForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Новый пароль',
}

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <div className={styles.panelWrap}>
          <section className={styles.panel} data-testid={TEST_ID.pageReset}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Новый пароль</h1>
            <p className={styles.copy}>Придумайте пароль не короче 8 символов.</p>
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
            <p className={styles.footer}>
              <Link className={styles.footerLink} href="/app/login">
                К входу
              </Link>
            </p>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
