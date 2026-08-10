import type { Metadata } from 'next'
import Link from 'next/link'

import { RequireSession } from '@/features/auth'
import styles from './app.module.css'

export const metadata: Metadata = {
  title: 'Кабинет',
}

export default function CabinetPage() {
  return (
    <RequireSession
      fallback={
        <main className={styles.page}>
          <div className="shell">
            <p className={styles.copy}>Проверяем сессию…</p>
          </div>
        </main>
      }
    >
      <main className={styles.page}>
        <div className="shell">
          <header className="site-header">
            <Link href="/" className="brand">
              Lustra
            </Link>
            <nav className="nav" aria-label="Основная навигация">
              <Link href="/catalog">Каталог</Link>
              <Link href="/app">Кабинет</Link>
            </nav>
          </header>

          <section className={styles.shellPanel}>
            <p className={styles.eyebrow}>Личный кабинет</p>
            <h1 className={styles.title}>Кабинет</h1>
            <p className={styles.copy}>
              Здесь появится расписание, услуги и брони. Пока это заглушка для
              навигации и локального просмотра.
            </p>
            <div className={styles.actions}>
              <Link className="btn btn-primary" href="/catalog">
                К каталогу
              </Link>
              <Link className="btn btn-ghost" href="/">
                На главную
              </Link>
            </div>
          </section>
        </div>
      </main>
    </RequireSession>
  )
}
