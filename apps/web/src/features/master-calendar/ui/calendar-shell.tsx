'use client'

import { useState } from 'react'
import cn from 'classnames'

import type { DayItems } from '@/features/master-calendar/model/group-calendar'
import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'
import { useCalendarData } from '@/features/master-calendar/model/use-calendar-data'
import { BlockDialog } from '@/features/master-calendar/ui/block-dialog'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { DayTimeline } from '@/features/master-calendar/ui/day-timeline'
import { WeekGrid } from '@/features/master-calendar/ui/week-grid'
import { ApiError } from '@/shared/api/http'
import { Button } from '@/shared/ui/button'

export function CalendarShell() {
  const calendar = useCalendarData()
  const [blockOpen, setBlockOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const days =
    calendar.data == null
      ? []
      : groupCalendarByDay(
          calendar.data,
          calendar.range.from,
          calendar.range.to,
        )

  const handleRemoveBlock = async (blockId: string) => {
    setActionError(null)

    try {
      await calendar.removeBlock(blockId)
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : 'Не удалось снять блок',
      )
    }
  }

  const rangeLabel =
    calendar.range.from === calendar.range.to
      ? calendar.range.from
      : `${calendar.range.from} — ${calendar.range.to}`

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Календарь</h1>
        <div className={styles.toolbar}>
          <Button type="button" variant="ghost" onClick={calendar.goPrev}>
            Назад
          </Button>
          <Button type="button" variant="ghost" onClick={calendar.goToday}>
            Сегодня
          </Button>
          <Button type="button" variant="ghost" onClick={calendar.goNext}>
            Вперёд
          </Button>
          <span className={styles.rangeLabel}>{rangeLabel}</span>
          <div className={styles.modeSwitch} role="group" aria-label="Вид">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                styles.modeButton,
                calendar.mode === 'day' && styles.modeButtonActive,
              )}
              onClick={() => calendar.changeMode('day')}
            >
              День
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                styles.modeButton,
                calendar.mode === 'week' && styles.modeButtonActive,
              )}
              onClick={() => calendar.changeMode('week')}
            >
              Неделя
            </Button>
          </div>
          <Button type="button" onClick={() => setBlockOpen(true)}>
            Блок / обед
          </Button>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.swatchOpen} /> свободно
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchBlock} /> блок
          </span>
        </div>
      </header>

      {actionError ? <p className={styles.fieldError}>{actionError}</p> : null}

      <CalendarBody
        status={calendar.status}
        errorMessage={calendar.errorMessage}
        mode={calendar.mode}
        days={days}
        onReload={calendar.reloadCalendar}
        onSelectDay={calendar.selectDay}
        onRemoveBlock={handleRemoveBlock}
      />

      {blockOpen ? (
        <BlockDialog
          defaultDate={calendar.anchorDate}
          onClose={() => setBlockOpen(false)}
          onSubmit={calendar.addBlock}
        />
      ) : null}
    </section>
  )
}

type CalendarBodyProps = {
  status: 'loading' | 'error' | 'empty' | 'success'
  errorMessage: string | null
  mode: 'day' | 'week'
  days: DayItems[]
  onReload: () => void
  onSelectDay: (ymdDate: string) => void
  onRemoveBlock: (blockId: string) => void
}

function CalendarBody({
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

type CalendarGridProps = {
  mode: 'day' | 'week'
  days: DayItems[]
  onSelectDay: (ymdDate: string) => void
  onRemoveBlock: (blockId: string) => void
}

function CalendarGrid({
  mode,
  days,
  onSelectDay,
  onRemoveBlock,
}: CalendarGridProps) {
  if (mode === 'week') {
    return <WeekGrid days={days} onSelectDay={onSelectDay} />
  }

  const dayView = days[0]

  if (!dayView) {
    return null
  }

  return (
    <DayTimeline
      date={dayView.date}
      openSlots={dayView.openSlots}
      blocks={dayView.blocks}
      onRemoveBlock={onRemoveBlock}
    />
  )
}
