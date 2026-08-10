import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthHeader, LoginForm } from '@/features/auth'
import styles from '../auth.module.css'

export const metadata: Metadata = {
  title: 'Вход',
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className="shell">
        <AuthHeader variant="login" />

        <div className={styles.panelWrap}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>Аккаунт</p>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.copy}>Войдите, чтобы открыть личный кабинет.</p>
          <LoginForm />
          <p className={styles.footer}>
            Нет аккаунта? <Link href="/app/register">Зарегистрироваться</Link>
          </p>
        </section>
        </div>
      </div>
    </main>
  )
}
