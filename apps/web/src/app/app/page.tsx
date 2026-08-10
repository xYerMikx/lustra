import type { Metadata } from 'next'

import { RequireSession } from '@/features/auth'
import { ButtonLink } from '@/shared/ui/button'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from './app.module.css'

export const metadata: Metadata = {
  title: 'Кабинет',
}

export default function CabinetPage() {
  return (
    <RequireSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome
          navItems={[
            { href: '/catalog', label: 'Каталог' },
            { href: '/app', label: 'Кабинет' },
          ]}
        >
          <section className={styles.shellPanel}>
            <p className={styles.eyebrow}>Личный кабинет</p>
            <h1 className={styles.title}>Кабинет</h1>
            <p className={styles.copy}>
              Здесь появится расписание, услуги и брони. Пока это заглушка для
              навигации и локального просмотра.
            </p>
            <div className={styles.actions}>
              <ButtonLink href="/catalog">К каталогу</ButtonLink>
              <ButtonLink href="/" variant="ghost">
                На главную
              </ButtonLink>
            </div>
          </section>
        </SiteChrome>
      </main>
    </RequireSession>
  )
}
