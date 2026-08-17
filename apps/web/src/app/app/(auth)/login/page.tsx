import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { LoginForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Вход',
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <div className={styles.panelWrap}>
          <section className={styles.panel} data-testid={TEST_ID.pageLogin}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Вход</h1>
            <p className={styles.copy}>Войдите, чтобы открыть личный кабинет.</p>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
            <p className={styles.footer}>
              Нет аккаунта?{' '}
              <Link className={styles.footerLink} href="/app/register">
                Зарегистрироваться
              </Link>
            </p>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
