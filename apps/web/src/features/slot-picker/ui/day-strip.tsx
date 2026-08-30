'use client'

import type { AvailabilityDayView } from '@lumira/contracts'
import cn from 'classnames'

import { formatDayStripLabel } from '@/features/slot-picker/model/format-day-strip-label'
import styles from '@/features/slot-picker/ui/slot-picker.module.css'

type DayStripProps = {
  days: AvailabilityDayView[]
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function DayStrip({ days, selectedDate, onSelect }: DayStripProps) {
  return (
    <div className={styles.dayStrip} role="listbox" aria-label="Дни">
      {days.map((day) => (
        <button
          key={day.date}
          type="button"
          role="option"
          aria-selected={day.date === selectedDate}
          className={cn(
            styles.dayChip,
            day.date === selectedDate && styles.dayChipActive,
            !day.hasOpen && styles.dayChipMuted,
          )}
          onClick={() => onSelect(day.date)}
        >
          <span className={styles.dayLabel}>
            {formatDayStripLabel(day.date)}
          </span>
          {day.hasOpen ? <span className={styles.dayDot} /> : null}
        </button>
      ))}
    </div>
  )
}
