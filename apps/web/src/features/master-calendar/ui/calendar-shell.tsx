'use client'

import { useState } from 'react'
import type { MasterClientView, ServiceView } from '@lustra/contracts'

import { groupCalendarByDay } from '@/features/master-calendar/model/group-calendar'
import { useCalendarData } from '@/features/master-calendar/model/use-calendar-data'
import { BlockDialog } from '@/features/master-calendar/ui/block-dialog'
import styles from '@/features/master-calendar/ui/calendar.module.css'
import { CalendarBody } from '@/features/master-calendar/ui/calendar-body'
import { CalendarNotice } from '@/features/master-calendar/ui/calendar-notice'
import { CalendarToolbar } from '@/features/master-calendar/ui/calendar-toolbar'
import { ExceptionDialog } from '@/features/master-calendar/ui/exception-dialog'
import { ManualBookingDialog } from '@/features/master-calendar/ui/manual-booking-dialog'
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
  const calendar = useCalendarData()
  const [blockOpen, setBlockOpen] = useState(false)
  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [manual, setManual] = useState<ManualDialogState | null>(null)
  const [feedback, setFeedback] = useState<CalendarFeedback | null>(null)

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

  const handleOpenManual = async (startsAtIso: string | null) => {
    setFeedback(null)

    try {
      const context = await calendar.loadManualContext()

      if (context.services.length === 0) {
        setFeedback({
          tone: 'error',
          text: 'Сначала добавьте услугу в кабинете',
        })

        return
      }

      setManual({ startsAtIso, ...context })
    } catch (error) {
      showError(error, 'Не удалось открыть запись')
    }
  }

  const rangeLabel =
    calendar.range.from === calendar.range.to
      ? calendar.range.from
      : `${calendar.range.from} — ${calendar.range.to}`

  return (
    <section className={styles.shell} data-testid={TEST_ID.pageCalendar}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Кабинет мастера</p>
        <h1 className={styles.title}>Календарь</h1>
        <CalendarToolbar
          rangeLabel={rangeLabel}
          mode={calendar.mode}
          onPrev={calendar.goPrev}
          onToday={calendar.goToday}
          onNext={calendar.goNext}
          onChangeMode={calendar.changeMode}
          onOpenManual={() => void handleOpenManual(null)}
          onOpenBlock={() => setBlockOpen(true)}
          onOpenException={() => setExceptionOpen(true)}
        />
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.swatchOpen} /> свободно
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchBlock} /> блок
          </span>
          <span className={styles.legendItem}>
            <span className={styles.swatchException} /> исключение
          </span>
        </div>
      </header>

      {feedback ? (
        <CalendarNotice tone={feedback.tone} text={feedback.text} />
      ) : null}

      <CalendarBody
        status={calendar.status}
        errorMessage={calendar.errorMessage}
        mode={calendar.mode}
        days={days}
        onReload={calendar.reloadCalendar}
        onSelectDay={calendar.selectDay}
        onSelectSlot={handleOpenManual}
        onRemoveBlock={handleRemoveBlock}
        onRemoveException={handleRemoveException}
      />

      {blockOpen ? (
        <BlockDialog
          defaultDate={calendar.anchorDate}
          onClose={() => setBlockOpen(false)}
          onSubmit={async (input) => {
            await calendar.addBlock(input)
            setFeedback({ tone: 'success', text: 'Блок сохранён' })
          }}
        />
      ) : null}

      {exceptionOpen ? (
        <ExceptionDialog
          defaultDate={calendar.anchorDate}
          onClose={() => setExceptionOpen(false)}
          onSubmit={async (date, input) => {
            await calendar.addException(date, input)
            setFeedback({ tone: 'success', text: 'Исключение сохранено' })
          }}
        />
      ) : null}

      {manual ? (
        <ManualBookingDialog
          defaultDate={calendar.anchorDate}
          defaultStartsAt={manual.startsAtIso}
          services={manual.services}
          clients={manual.clients}
          onClose={() => setManual(null)}
          onSubmit={async (input) => {
            await calendar.addManualBooking(input)
            setFeedback({ tone: 'success', text: 'Клиент записан' })
          }}
        />
      ) : null}
    </section>
  )
}
