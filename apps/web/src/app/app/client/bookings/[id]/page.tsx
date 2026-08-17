import type { Metadata } from 'next'

import { RequireClientSession } from '@/features/auth'
import { ClientBookingDetailShell } from '@/features/booking-cabinets'
import { SiteChrome } from '@/shared/ui/site-chrome'
import styles from '@/app/app/app.module.css'

export const metadata: Metadata = {
  title: 'Запись',
}

type ClientBookingDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ClientBookingDetailPage({
  params,
}: ClientBookingDetailPageProps) {
  const { id } = await params

  return (
    <RequireClientSession
      fallback={
        <main className={styles.page}>
          <p className={styles.copy}>Проверяем сессию…</p>
        </main>
      }
    >
      <main className={styles.page}>
        <SiteChrome>
          <ClientBookingDetailShell bookingId={id} />
        </SiteChrome>
      </main>
    </RequireClientSession>
  )
}
