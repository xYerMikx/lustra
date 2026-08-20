import Link from 'next/link'

import { ChevronLeftIcon } from '@/shared/ui/icon-pack'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'

type MasterBookingBackLinkProps = {
  href: string
  label: string
}

export function MasterBookingBackLink({
  href,
  label,
}: MasterBookingBackLinkProps) {
  return (
    <Link className={styles.backLink} href={href}>
      <ChevronLeftIcon />
      {label}
    </Link>
  )
}
