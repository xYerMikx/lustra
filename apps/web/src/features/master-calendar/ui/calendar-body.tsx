'use client'

import type { DayItems } from '@/features/master-calendar/model/group-calendar'
import { CalendarGrid } from '@/features/master-calendar/ui/calendar-grid'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { Button } from '@/shared/ui/button'

export type CalendarBodyProps = {
  status: 'loading' | 'error' | 'empty' | 'success'
  errorMessage: string | null
  mode: 'day' | 'week'
  days: DayItems[]
  calendarPath: string
  canBook: boolean
  todayTick: number
  onReload: () => void
  onSelectDay: (ymdDate: string) => void
  onSelectSlot: (startsAtIso: string) => void
  onRemoveBlock: (blockId: string) => void
  onRemoveException: (ymdDate: string) => void
  onCloseSlot: (slotId: string) => void
  onReopenSlot: (slotId: string) => void
  onVisibleWeekRangeChange: (range: { from: string; to: string }) => void
}

export function CalendarBody({
  status,
  errorMessage,
  mode,
  days,
  calendarPath,
  canBook,
  todayTick,
  onReload,
  onSelectDay,
  onSelectSlot,
  onRemoveBlock,
  onRemoveException,
  onCloseSlot,
  onReopenSlot,
  onVisibleWeekRangeChange,
}: CalendarBodyProps) {
  if (status === 'loading') {
    return <div className={styles.stateBox}>Загружаем сетку…</div>
  }

  if (status === 'error') {
    return (
      <div className={styles.errorBox}>
        <p>{errorMessage}</p>
        <Button type="button" onClick={onReload}>
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <>
      {status === 'empty' ? (
        <div className={styles.stateBox}>
          На этот период нет открытых окон и блоков. Задайте недельный график —
          слоты появятся здесь.
        </div>
      ) : null}
      <CalendarGrid
        mode={mode}
        days={days}
        calendarPath={calendarPath}
        canBook={canBook}
        todayTick={todayTick}
        onSelectDay={onSelectDay}
        onSelectSlot={onSelectSlot}
        onRemoveBlock={onRemoveBlock}
        onRemoveException={onRemoveException}
        onCloseSlot={onCloseSlot}
        onReopenSlot={onReopenSlot}
        onVisibleWeekRangeChange={onVisibleWeekRangeChange}
      />
    </>
  )
}
