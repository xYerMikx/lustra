import type { Metadata } from 'next'
import Link from 'next/link'

import { RegisterForm } from '@/features/auth'
import styles from '../auth.module.css'

export const metadata: Metadata = {
  title: 'Регистрация',
}

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className="shell">
        <header className="site-header">
          <Link href="/" className="brand">
            Lustra
          </Link>
          <nav className="nav" aria-label="Основная навигация">
            <Link href="/app/login">Вход</Link>
          </nav>
        </header>

        <section className={styles.panel}>
          <p className={styles.eyebrow}>Аккаунт</p>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.copy}>
            Три поля, выбор роли и согласие — и можно переходить в кабинет.
          </p>
          <RegisterForm />
          <p className={styles.footer}>
            Уже есть аккаунт? <Link href="/app/login">Войти</Link>
          </p>
        </section>
      </div>
    </main>
  )
}
