'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { MasterClientView, ServiceView } from '@lustra/contracts'

import { calendarHref, isYmdDate } from '@/features/master-calendar/model/calendar-href'
import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'
import {
  shiftAnchorDate,
  todayYmdDate,
  type CalendarViewMode,
} from '@/features/master-calendar/model/calendar-range'
import { calendarRangeLabel } from '@/features/master-calendar/model/calendar-range-label'
import { submitWithSuccess } from '@/features/master-calendar/model/submit-with-success'
import { useCalendarData } from '@/features/master-calendar/model/use-calendar-data'
import { BlockDialog } from '@/features/master-calendar/ui/block-dialog'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { CalendarBody } from '@/features/master-calendar/ui/calendar-body'
import { CalendarFinanceHint } from '@/features/master-calendar/ui/calendar-finance-hint'
import { CalendarNotice } from '@/features/master-calendar/ui/calendar-notice'
import { CalendarToolbar } from '@/features/master-calendar/ui/calendar-toolbar'
import { ExceptionDialog } from '@/features/master-calendar/ui/exception-dialog'
import { ExtraSlotDialog } from '@/features/master-calendar/ui/extra-slot-dialog'
import { ManualBookingDialog } from '@/features/manual-booking/ui/manual-booking-dialog'
import { ApiError } from '@/shared/api/http'
import { TEST_ID } from '@/shared/lib/test-id'

type ManualDialogState = {
  startsAtIso: string | null
  services: ServiceView[]
  clients: MasterClientView[]
}

type CalendarFeedback = {
  tone: 'success' | 'error'
  text: string
}

export function CalendarShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const today = todayYmdDate()
  const mode: CalendarViewMode =
    searchParams.get('view') === 'day' ? 'day' : 'week'
  const dateParam = searchParams.get('date')
  const anchorDate = isYmdDate(dateParam) ? dateParam : today
  const calendar = useCalendarData(mode, anchorDate)
  const calendarPath = calendarHref(mode, anchorDate)
  const canCreateBooking = anchorDate >= today
  const [blockOpen, setBlockOpen] = useState(false)
  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [extraOpen, setExtraOpen] = useState(false)
  const [manual, setManual] = useState<ManualDialogState | null>(null)
  const [feedback, setFeedback] = useState<CalendarFeedback | null>(null)
  const [todayTick, setTodayTick] = useState(0)
  const [visibleWeekRange, setVisibleWeekRange] = useState<{
    from: string
    to: string
  } | null>(null)

  const setCalendarView = (nextMode: CalendarViewMode, nextDate: string) => {
    router.replace(calendarHref(nextMode, nextDate), { scroll: false })
  }

  const days =
    calendar.data == null
      ? []
      : groupCalendarByDay(
          calendar.data,
          calendar.range.from,
          calendar.range.to,
        )

  const showError = (error: unknown, fallback: string) => {
    setFeedback({
      tone: 'error',
      text: error instanceof ApiError ? error.message : fallback,
    })
  }

  const handleRemoveBlock = async (blockId: string) => {
    setFeedback(null)

    try {
      await calendar.removeBlock(blockId)
      setFeedback({ tone: 'success', text: 'Блок снят' })
    } catch (error) {
      showError(error, 'Не удалось снять блок')
    }
  }

  const handleRemoveException = async (ymdDate: string) => {
    setFeedback(null)

    try {
      await calendar.removeException(ymdDate)
      setFeedback({ tone: 'success', text: 'Исключение снято' })
    } catch (error) {
      showError(error, 'Не удалось снять исключение')
    }
  }

  const handleCloseSlot = async (slotId: string) => {
    setFeedback(null)

    try {
      await calendar.closeSlot(slotId)
      setFeedback({ tone: 'success', text: 'Слот скрыт для клиентов' })
    } catch (error) {
      showError(error, 'Не удалось убрать слот')
    }
  }

  const handleReopenSlot = async (slotId: string) => {
    setFeedback(null)

    try {
      await calendar.reopenSlot(slotId)
      setFeedback({ tone: 'success', text: 'Слот снова доступен' })
    } catch (error) {
      showError(error, 'Не удалось вернуть слот')
    }
  }

  const handleOpenManual = async (startsAtIso: string | null) => {
    setFeedback(null)

    if (!canCreateBooking) {
      setFeedback({
        tone: 'error',
        text: 'Нельзя записать клиента на прошедшую дату',
      })

      return
    }

    try {
      const formData = await calendar.loadManualBookingFormData()

      if (formData.services.length === 0) {
        setFeedback({
          tone: 'error',
          text: 'Сначала добавьте услугу в кабинете',
        })

        return
      }

      setManual({ startsAtIso, ...formData })
    } catch (error) {
      showError(error, 'Не удалось открыть запись')
    }
  }

  const rangeLabel =
    mode === 'week' && visibleWeekRange
      ? calendarRangeLabel(visibleWeekRange.from, visibleWeekRange.to)
      : calendarRangeLabel(calendar.range.from, calendar.range.to)

  const goToToday = () => {
    setCalendarView(mode, today)
    setTodayTick((tick) => tick + 1)
  }

  const showSuccess = (text: string) => {
    setFeedback({ tone: 'success', text })
  }

  const submitBlock = submitWithSuccess(
    calendar.addBlock,
    showSuccess,
    'Блок сохранён',
  )
  const submitException = submitWithSuccess(
    calendar.addException,
    showSuccess,
    'Исключение сохранено',
  )
  const submitManual = submitWithSuccess(
    calendar.addManualBooking,
    showSuccess,
    'Клиент записан',
  )
  const submitExtra = submitWithSuccess(
    calendar.addExtraSlot,
    showSuccess,
    'Дополнительный слот добавлен',
  )

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageCalendar}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Календарь</h1>
        <CalendarFinanceHint />
        <CalendarToolbar
          rangeLabel={rangeLabel}
          mode={mode}
          canCreateBooking={canCreateBooking}
          onPrevDay={() =>
            setCalendarView(mode, shiftAnchorDate(anchorDate, 'day', -1))
          }
          onToday={goToToday}
          onNextDay={() =>
            setCalendarView(mode, shiftAnchorDate(anchorDate, 'day', 1))
          }
          onChangeMode={(next) => setCalendarView(next, anchorDate)}
          onBackToWeek={() => setCalendarView('week', anchorDate)}
          onOpenManual={() => void handleOpenManual(null)}
          onOpenBlock={() => setBlockOpen(true)}
          onOpenException={() => setExceptionOpen(true)}
          onOpenExtra={() => setExtraOpen(true)}
        />
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.swatchOpen} /> свободно
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchHeld} /> холд
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchBooked} /> запись
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchBlock} /> блок
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchException} /> исключение
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchClosed} /> скрыт
          </span>
        </div>
      </header>

      {feedback ? (
        <CalendarNotice tone={feedback.tone} text={feedback.text} />
      ) : null}

      <CalendarBody
        status={calendar.status}
        errorMessage={calendar.errorMessage}
        mode={mode}
        days={days}
        calendarPath={calendarPath}
        canBook={canCreateBooking}
        todayTick={todayTick}
        onReload={calendar.reloadCalendar}
        onSelectDay={(ymdDate) => setCalendarView('day', ymdDate)}
        onSelectSlot={handleOpenManual}
        onRemoveBlock={handleRemoveBlock}
        onRemoveException={handleRemoveException}
        onCloseSlot={handleCloseSlot}
        onReopenSlot={handleReopenSlot}
        onVisibleWeekRangeChange={setVisibleWeekRange}
      />

      {blockOpen ? (
        <BlockDialog
          defaultDate={anchorDate}
          onClose={() => setBlockOpen(false)}
          onSubmit={submitBlock}
        />
      ) : null}

      {exceptionOpen ? (
        <ExceptionDialog
          defaultDate={anchorDate}
          onClose={() => setExceptionOpen(false)}
          onSubmit={submitException}
        />
      ) : null}

      {extraOpen ? (
        <ExtraSlotDialog
          defaultDate={anchorDate < today ? today : anchorDate}
          onClose={() => setExtraOpen(false)}
          onSubmit={submitExtra}
        />
      ) : null}

      {manual ? (
        <ManualBookingDialog
          defaultDate={anchorDate < today ? today : anchorDate}
          defaultStartsAt={manual.startsAtIso}
          minDate={today}
          services={manual.services}
          clients={manual.clients}
          onClose={() => setManual(null)}
          onSubmit={submitManual}
        />
      ) : null}
    </section>
  )
}
