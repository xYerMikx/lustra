import type { MasterCalendarSlotView } from '@lumira/contracts'
import Link from 'next/link'

import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'
import { formatTimeInTimeZone, MASTER_TIMEZONE } from '@/shared/lib/tz'

type UpcomingBookingRowProps = {
  slot: MasterCalendarSlotView
  dayLabel: string
}

export function UpcomingBookingRow({ slot, dayLabel }: UpcomingBookingRowProps) {
  const time = formatTimeInTimeZone(new Date(slot.startsAt), MASTER_TIMEZONE)
  const name = slot.clientName ?? 'Клиент'
  const href = slot.bookingId
    ? `/app/master/bookings/${slot.bookingId}`
    : '/app/master/bookings'

  return (
    <Link href={href} className={styles.slotItem}>
      <span>
        {dayLabel} · {name}
      </span>
      <span className={styles.slotTime}>{time}</span>
    </Link>
  )
}
