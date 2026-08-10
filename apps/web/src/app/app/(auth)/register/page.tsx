import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthHeader, RegisterForm } from '@/features/auth'
import styles from '@/features/auth/ui/auth-page.module.css'

export const metadata: Metadata = {
  title: 'Регистрация',
}

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className="shell">
        <AuthHeader variant="register" />

        <div className={styles.panelWrap}>
          <section className={styles.panel}>
            <p className={styles.eyebrow}>Аккаунт</p>
            <h1 className={styles.title}>Регистрация</h1>
            <RegisterForm />
            <p className={styles.footer}>
              Уже есть аккаунт?{' '}
              <Link className={styles.footerLink} href="/app/login">
                Войти
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
