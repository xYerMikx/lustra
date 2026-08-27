import type { MasterCalendarSlotView } from '@lustra/contracts'

import {
  formatTimeInTimeZone,
  formatYmdDateInTimeZone,
  MASTER_TIMEZONE,
  ymdToUtcDate,
} from '@/shared/lib/tz'
import styles from '@/features/master-cabinet/ui/master-cabinet.module.css'

type UpcomingSlotsListProps = {
  slots: MasterCalendarSlotView[]
  isLoading: boolean
}

export function UpcomingSlotsList({
  slots,
  isLoading,
}: UpcomingSlotsListProps) {
  if (isLoading) {
    return <p className={styles.muted}>Загружаем слоты…</p>
  }

  if (slots.length === 0) {
    return (
      <p className={styles.muted}>
        Ближайших свободных слотов нет. Откройте календарь, чтобы настроить
        график.
      </p>
    )
  }

  return (
    <ul className={styles.slotList}>
      {slots.map((slot) => {
        const start = new Date(slot.startsAt)
        const day = formatYmdDateInTimeZone(start, MASTER_TIMEZONE)
        const time = formatTimeInTimeZone(start, MASTER_TIMEZONE)

        return (
          <li key={slot.id} className={styles.slotItem}>
            <span>{formatDayLabel(day)}</span>
            <span className={styles.slotTime}>{time}</span>
          </li>
        )
      })}
    </ul>
  )
}

function formatDayLabel(ymd: string): string {
  const date = ymdToUtcDate(ymd)

  return new Intl.DateTimeFormat('ru-BY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}
