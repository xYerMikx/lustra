'use client'

import { useState } from 'react'
import cn from 'classnames'

import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'
import { useCalendarData } from '@/features/master-calendar/model/use-calendar-data'
import { BlockDialog } from '@/features/master-calendar/ui/block-dialog'
import { CalendarBody } from '@/features/master-calendar/ui/calendar-body'
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
