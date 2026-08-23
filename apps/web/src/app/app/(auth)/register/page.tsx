import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import {
  AuthFormPending,
  RedirectIfAuthenticated,
  RegisterForm,
} from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Регистрация',
}

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <SiteChrome>
        <div className={styles.panelWrap}>
          <section className={styles.panel} data-testid={TEST_ID.pageRegister}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Регистрация</h1>
            <Suspense fallback={<AuthFormPending />}>
              <RedirectIfAuthenticated>
                <RegisterForm />
                <p className={styles.footer}>
                  Уже есть аккаунт?{' '}
                  <Link className={styles.footerLink} href="/app/login">
                    Войти
                  </Link>
                </p>
              </RedirectIfAuthenticated>
            </Suspense>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
