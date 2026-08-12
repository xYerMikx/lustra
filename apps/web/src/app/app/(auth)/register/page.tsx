import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { RegisterForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Регистрация',
}

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <SiteChrome
        navItems={[
          { href: '/', label: 'Главная' },
          { href: '/catalog', label: 'Каталог' },
          { href: '/app/login', label: 'Вход' },
        ]}
      >
        <div className={styles.panelWrap}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Регистрация</h1>
            <Suspense fallback={null}>
              <RegisterForm />
            </Suspense>
            <p className={styles.footer}>
              Уже есть аккаунт?{' '}
              <Link className={styles.footerLink} href="/app/login">
                Войти
              </Link>
            </p>
          </section>
        </div>
      </SiteChrome>
    </main>
  )
}
