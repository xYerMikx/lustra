'use client'

import { useState } from 'react'
import cn from 'classnames'

import { DayTimeline } from '@/features/master-calendar/ui/day-timeline'
import { WeekGrid } from '@/features/master-calendar/ui/week-grid'
import { BlockDialog } from '@/features/master-calendar/ui/block-dialog'
import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'
import { useCalendarData } from '@/features/master-calendar/model/use-calendar-data'
import styles from '@/features/master-calendar/ui/calendar.module.css'
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

  const dayView = days[0]

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
          <span className={styles.rangeLabel}>
            {calendar.range.from === calendar.range.to
              ? calendar.range.from
              : `${calendar.range.from} — ${calendar.range.to}`}
          </span>
          <div className={styles.modeSwitch} role="group" aria-label="Вид">
            <button
              type="button"
              className={cn(
                styles.modeButton,
                calendar.mode === 'day' && styles.modeButtonActive,
              )}
              onClick={() => calendar.changeMode('day')}
            >
              День
            </button>
            <button
              type="button"
              className={cn(
                styles.modeButton,
                calendar.mode === 'week' && styles.modeButtonActive,
              )}
              onClick={() => calendar.changeMode('week')}
            >
              Неделя
            </button>
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

      {calendar.status === 'loading' ? (
        <div className={styles.stateBox}>Загружаем сетку…</div>
      ) : null}

      {calendar.status === 'error' ? (
        <div className={styles.errorBox}>
          <p>{calendar.errorMessage}</p>
          <Button type="button" onClick={calendar.refresh}>
            Повторить
          </Button>
        </div>
      ) : null}

      {calendar.status === 'empty' ? (
        <div className={styles.stateBox}>
          На этот период нет открытых окон и блоков. Задайте недельный график в
          онбординге — слоты появятся здесь.
        </div>
      ) : null}

      {calendar.status === 'success' || calendar.status === 'empty' ? (
        calendar.mode === 'week' ? (
          <WeekGrid days={days} onSelectDay={calendar.selectDay} />
        ) : dayView ? (
          <DayTimeline
            date={dayView.date}
            openSlots={dayView.openSlots}
            blocks={dayView.blocks}
            onRemoveBlock={handleRemoveBlock}
          />
        ) : null
      ) : null}

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
