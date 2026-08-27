'use client'

import Link from 'next/link'

import { MasterBookClientButton } from '@/features/booking-cabinets/ui/master-book-client-button'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterBookingsHeaderProps = {
  onBooked: () => void
}

export function MasterBookingsHeader({ onBooked }: MasterBookingsHeaderProps) {
  return (
    <header>
      <p className={styles.eyebrow}>Кабинет мастера</p>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>Записи</h1>
        <MasterBookClientButton
          onBooked={onBooked}
          testId={TEST_ID.bookingsManualOpen}
        />
      </div>
      <p className={styles.headerLead}>
        После визита цена услуги попадает в финансы. Чаевые и расходы можно дописать
        там же.{' '}
        <Link href="/app/master/ledger" className={styles.headerLeadLink}>
          Финансы
        </Link>
      </p>
    </header>
  )
}
