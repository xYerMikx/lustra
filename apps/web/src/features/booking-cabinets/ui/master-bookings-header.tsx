'use client'

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
    </header>
  )
}
