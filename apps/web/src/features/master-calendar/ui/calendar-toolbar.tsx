'use client'

import cn from 'classnames'

import styles from '@/features/master-calendar/ui/calendar.module.css'
import { Button } from '@/shared/ui/button'
import { TEST_ID } from '@/shared/lib/test-id'

type CalendarToolbarProps = {
  rangeLabel: string
  mode: 'day' | 'week'
  canCreateBooking: boolean
  onPrev: () => void
  onToday: () => void
  onNext: () => void
  onChangeMode: (mode: 'day' | 'week') => void
  onBackToWeek: () => void
  onOpenManual: () => void
  onOpenBlock: () => void
  onOpenException: () => void
}

export function CalendarToolbar({
  rangeLabel,
  mode,
  canCreateBooking,
  onPrev,
  onToday,
  onNext,
  onChangeMode,
  onBackToWeek,
  onOpenManual,
  onOpenBlock,
  onOpenException,
}: CalendarToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarRow}>
        <div
          className={styles.segmented}
          role="group"
          aria-label="Период календаря"
        >
          <Button
            type="button"
            variant="ghost"
            className={styles.segmentButton}
            aria-label="Предыдущий период"
            onClick={onPrev}
          >
            Назад
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={styles.segmentButton}
            onClick={onToday}
          >
            Сегодня
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={styles.segmentButton}
            aria-label="Следующий период"
            onClick={onNext}
          >
            Вперёд
          </Button>
        </div>
        <span className={styles.rangeLabel}>{rangeLabel}</span>
      </div>

      <div className={styles.toolbarRow}>
        <div
          className={styles.segmented}
          role="group"
          aria-label="Вид календаря"
        >
          <Button
            type="button"
            variant="ghost"
            className={cn(
              styles.segmentButton,
              mode === 'day' && styles.segmentButtonActive,
            )}
            aria-pressed={mode === 'day'}
            onClick={() => onChangeMode('day')}
          >
            День
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              styles.segmentButton,
              mode === 'week' && styles.segmentButtonActive,
            )}
            aria-pressed={mode === 'week'}
            onClick={() => onChangeMode('week')}
          >
            Неделя
          </Button>
        </div>
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
          Исключение
        </Button>
      </div>
    </div>
  )
}
