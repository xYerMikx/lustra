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
  onReload: () => void
  onSelectDay: (ymdDate: string) => void
  onRemoveBlock: (blockId: string) => void
}

export function CalendarBody({
  status,
  errorMessage,
  mode,
  days,
  onReload,
  onSelectDay,
  onRemoveBlock,
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
          На этот период нет открытых окон и блоков. Задайте недельный график в
          онбординге — слоты появятся здесь.
        </div>
      ) : null}
      <CalendarGrid
        mode={mode}
        days={days}
        onSelectDay={onSelectDay}
        onRemoveBlock={onRemoveBlock}
      />
    </>
  )
}
