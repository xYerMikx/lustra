import { formatDayLabel } from '@/features/master-cabinet/model/format-day-label'
import type { UpcomingBookingsPick } from '@/features/master-cabinet/model/pick-upcoming-bookings'
import { UpcomingBookingRow } from '@/features/master-cabinet/ui/upcoming-booking-row'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

type UpcomingBookingsListProps = {
  pick: UpcomingBookingsPick | null
  isLoading: boolean
}

export function UpcomingBookingsList({
  pick,
  isLoading,
}: UpcomingBookingsListProps) {
  if (isLoading) {
    return <p className={styles.muted}>Загружаем записи…</p>
  }

  if (!pick) {
    return (
      <p className={styles.muted}>
        Ближайших рабочих дней в календаре нет. Откройте календарь, чтобы
        настроить график.
      </p>
    )
  }

  const heading = pick.isToday ? 'Сегодня' : formatDayLabel(pick.ymdDate)

  if (pick.slots.length === 0) {
    return (
      <p className={styles.muted}>
        {pick.isToday
          ? 'На сегодня записей больше нет.'
          : `На ${heading.toLowerCase()} записей пока нет.`}
      </p>
    )
  }

  return (
    <ul className={styles.slotList}>
      {pick.slots.map((slot) => (
        <li key={slot.id}>
          <UpcomingBookingRow slot={slot} dayLabel={heading} />
        </li>
      ))}
    </ul>
  )
}
