import type { BookingStatus } from '@lustra/contracts'

const LABELS: Record<BookingStatus, string> = {
  hold: 'Удержание',
  pending: 'Ожидает мастера',
  confirmed: 'Подтверждена',
  completed: 'Завершена',
  cancelled_by_client: 'Отменена вами',
  cancelled_by_master: 'Отменена мастером',
  no_show: 'Неявка',
  expired: 'Истекла',
}

export function bookingStatusLabel(status: BookingStatus): string {
  return LABELS[status]
}

export function formatBookingWhen(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)

  const day = new Intl.DateTimeFormat('ru-BY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start)

  const time = new Intl.DateTimeFormat('ru-BY', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${day}, ${time.format(start)}–${time.format(end)}`
}
