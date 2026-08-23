'use client'

import { useState } from 'react'

import { BookingInfoCard } from '@/features/booking-cabinets/ui/booking-info-card'
import styles from '@/features/booking-cabinets/ui/bookings.module.css'
import { ApiError } from '@/shared/api/http'
import { probeTelegramNotification } from '@/shared/api/telegram-client'
import { TEST_ID } from '@/shared/lib/test-id'
import { Button } from '@/shared/ui/button'

type DevNotifyProbeCardProps = {
  bookingId: string
}

export function DevNotifyProbeCard({ bookingId }: DevNotifyProbeCardProps) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const sendProbe = async () => {
    setBusy(true)
    setMessage(null)
    setFailed(false)

    try {
      await probeTelegramNotification(bookingId)
      setMessage('Сообщение отправлено в Telegram. Проверьте бота.')
    } catch (error) {
      setFailed(true)
      setMessage(
        error instanceof ApiError
          ? error.message
          : 'Не удалось отправить тестовое уведомление',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <BookingInfoCard title="Проверка уведомлений (dev)">
      <p className={styles.probeNote}>
        Отправит в ваш Telegram то же напоминание, что уходит перед визитом —
        без ожидания 2 часов. На настоящее расписание не влияет.
      </p>
      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => void sendProbe()}
          data-testid={TEST_ID.notifyProbe}
        >
          Проверить уведомление
        </Button>
      </div>
      {message ? (
        <p
          className={failed ? styles.error : styles.probeNote}
          data-testid={TEST_ID.notifyProbeStatus}
        >
          {message}
        </p>
      ) : null}
    </BookingInfoCard>
  )
}
