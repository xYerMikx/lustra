import type { Metadata } from 'next'

import { RequireMasterSession } from '@/features/auth'
import { MasterBookingDetailShell } from '@/features/booking-cabinets'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Запись',
}

type MasterBookingDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function MasterBookingDetailPage({
  params,
}: MasterBookingDetailPageProps) {
  const { id } = await params

  return (
    <RequireMasterSession
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
            { href: '/app/master/bookings', label: 'Записи' },
            { href: '/app/master/calendar', label: 'Календарь' },
          ]}
        >
          <MasterBookingDetailShell bookingId={id} />
        </SiteChrome>
      </main>
    </RequireMasterSession>
  )
}
