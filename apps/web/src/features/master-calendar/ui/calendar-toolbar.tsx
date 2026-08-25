'use client'

import styles from '@/features/master-calendar/ui/calendar.module.css'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/ui/icon-pack'
import { Tab, Tabs } from '@/shared/ui/tabs'

type CalendarToolbarProps = {
  rangeLabel: string
  mode: 'day' | 'week'
  canCreateBooking: boolean
  onPrevDay: () => void
  onToday: () => void
  onNextDay: () => void
  onChangeMode: (mode: 'day' | 'week') => void
  onBackToWeek: () => void
  onOpenManual: () => void
  onOpenBlock: () => void
  onOpenException: () => void
  onOpenExtra: () => void
}

export function CalendarToolbar({
  rangeLabel,
  mode,
  canCreateBooking,
  onPrevDay,
  onToday,
  onNextDay,
  onChangeMode,
  onBackToWeek,
  onOpenManual,
  onOpenBlock,
  onOpenException,
  onOpenExtra,
}: CalendarToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarRow}>
        {mode === 'day' ? (
          <div className={styles.dayNav}>
            <Button
              type="button"
              variant="icon"
              aria-label="Предыдущий день"
              onClick={onPrevDay}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              type="button"
              variant="icon"
              aria-label="Следующий день"
              onClick={onNextDay}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        ) : null}
        <span className={styles.rangeLabel}>{rangeLabel}</span>
        <Button
          type="button"
          variant="ghost"
          className={styles.todayLink}
          data-testid={TEST_ID.calendarToday}
          onClick={onToday}
        >
          Сегодня
        </Button>
      </div>

      <div className={styles.toolbarRow}>
        <Tabs
          value={mode}
          onChange={(next) => {
            if (next === 'day' || next === 'week') {
              onChangeMode(next)
            }
          }}
          aria-label="Вид календаря"
        >
          <Tab value="day">День</Tab>
          <Tab value="week">Неделя</Tab>
        </Tabs>
        {mode === 'day' ? (
          <Button
            type="button"
            variant="ghost"
            data-testid={TEST_ID.calendarBackToWeek}
            onClick={onBackToWeek}
          >
            К неделе
          </Button>
        ) : null}
      </div>

      <div className={styles.actionGrid}>
        <Button
          type="button"
          onClick={onOpenManual}
          disabled={!canCreateBooking}
          data-testid={TEST_ID.calendarManualOpen}
        >
          Записать клиента
        </Button>
        <Button
          type="button"
          onClick={onOpenBlock}
          data-testid={TEST_ID.calendarBlockOpen}
        >
          Блок / обед
        </Button>
        <Button
          type="button"
          onClick={onOpenException}
          data-testid={TEST_ID.calendarExceptionOpen}
        >
          График дня
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onOpenExtra}
          disabled={!canCreateBooking}
          data-testid={TEST_ID.calendarExtraOpen}
        >
          Доп. слот
        </Button>
      </div>
    </div>
  )
}
