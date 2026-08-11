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
              Расписание, услуги и брони. Календарь дня и недели уже доступен.
            </p>
            <div className={styles.actions}>
              <ButtonLink href="/app/master/calendar">Календарь</ButtonLink>
              <ButtonLink href="/catalog" variant="ghost">
                К каталогу
              </ButtonLink>
            </div>
          </section>
        </SiteChrome>
      </main>
    </RequireSession>
  )
}
