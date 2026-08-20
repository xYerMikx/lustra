import cn from 'classnames'
import type { BookingStatus } from '@lustra/contracts'

import { bookingStatusLabel } from '@/features/booking-cabinets/model/booking-labels'
import { bookingStatusTone } from '@/features/booking-cabinets/model/booking-status-tone'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { bookingStatusTestId } from '@/shared/lib/test-id'

const TONE_CLASS = {
  hold: styles.badgeHold,
  confirmed: styles.badgeConfirmed,
  done: styles.badgeDone,
  muted: styles.badgeMuted,
  alert: styles.badgeAlert,
}

type BookingStatusBadgeProps = {
  status: BookingStatus
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={cn(styles.badge, TONE_CLASS[bookingStatusTone(status)])}
      data-testid={bookingStatusTestId(status)}
    >
      {bookingStatusLabel(status)}
    </span>
  )
}
