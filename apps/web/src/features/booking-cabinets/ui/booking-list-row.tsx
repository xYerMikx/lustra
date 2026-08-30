import Link from 'next/link'
import type { BookingStatus } from '@lumira/contracts'

import { BookingStatusBadge } from '@/features/booking-cabinets/ui/booking-status-badge'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { bookingRowTestId } from '@/shared/lib/test-id'

type BookingListRowProps = {
  href: string
  bookingId: string
  title: string
  person: string
  when: string
  price: string
  status: BookingStatus
}

export function BookingListRow({
  href,
  bookingId,
  title,
  person,
  when,
  price,
  status,
}: BookingListRowProps) {
  return (
    <Link
      className={styles.row}
      href={href}
      data-testid={bookingRowTestId(bookingId)}
    >
      <div className={styles.rowHead}>
        <span className={styles.rowTitle}>{title}</span>
        <BookingStatusBadge status={status} />
      </div>
      <span className={styles.cardValue}>{person}</span>
      <span className={styles.cardHint}>{when}</span>
      <span className={styles.cardHint}>{price}</span>
    </Link>
  )
}
