import type { ReactNode } from 'react'

import styles from '@/features/booking-cabinets/ui/bookings.module.css'

type BookingInfoCardProps = {
  title: string
  children: ReactNode
}

export function BookingInfoCard({ title, children }: BookingInfoCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.cardTitle}>{title}</p>
      {children}
    </div>
  )
}
