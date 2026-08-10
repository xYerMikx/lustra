import type { Metadata } from 'next'
import Link from 'next/link'

import { LoginForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'
import { SiteChrome } from '@/shared/ui/site-chrome'

export const metadata: Metadata = {
  title: 'Вход',
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <SiteChrome
        navItems={[
          { href: '/', label: 'Главная' },
          { href: '/catalog', label: 'Каталог' },
          { href: '/app/register', label: 'Регистрация' },
        ]}
      >
        <div className={styles.panelWrap}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Вход</h1>
            <p className={styles.copy}>Войдите, чтобы открыть личный кабинет.</p>
            <LoginForm />
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
