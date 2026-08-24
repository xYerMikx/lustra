import {
  CLIENT_CANCEL_WARNING,
  MASTER_CANCEL_WARNING,
} from '@/features/booking-cabinets/model/cancel-warning-copy'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'

type BookingCancelWarningProps = {
  audience: 'client' | 'master'
}

export function BookingCancelWarning({ audience }: BookingCancelWarningProps) {
  const text =
    audience === 'client' ? CLIENT_CANCEL_WARNING : MASTER_CANCEL_WARNING

  return <p className={styles.cancelWarning}>{text}</p>
}
