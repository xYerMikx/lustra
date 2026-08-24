'use client'

import cn from 'classnames'

import { ButtonLink } from '@/shared/ui/button'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'

type ClientBookingsEmptyProps = {
  copy: string
  showBookCta: boolean
}

export function ClientBookingsEmpty({
  copy,
  showBookCta,
}: ClientBookingsEmptyProps) {
  if (!showBookCta) {
    return <p className={styles.empty}>{copy}</p>
  }

  return (
    <div className={cn(styles.empty, styles.emptyStack)}>
      <p className={styles.message}>{copy}</p>
      <div className={styles.actions}>
        <ButtonLink href="/app/client/book">Записаться</ButtonLink>
      </div>
    </div>
  )
}
