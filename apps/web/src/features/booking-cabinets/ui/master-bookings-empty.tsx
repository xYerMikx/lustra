'use client'

import { MasterBookClientButton } from '@/features/booking-cabinets/ui/master-book-client-button'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { TEST_ID } from '@/shared/lib/test-id'

type MasterBookingsEmptyProps = {
  onBooked: () => void
}

export function MasterBookingsEmpty({ onBooked }: MasterBookingsEmptyProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>В этом фильтре записей нет.</p>
      <MasterBookClientButton
        onBooked={onBooked}
        testId={TEST_ID.bookingsEmptyManualOpen}
      />
    </div>
  )
}
