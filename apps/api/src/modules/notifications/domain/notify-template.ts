import { MASTER_TIMEZONE } from '@/modules/scheduling/domain/tz'

export const NotifyTemplate = {
  Reminder24hClient: 'reminder_24h_client',
  Reminder2hMaster: 'reminder_2h_master',
  BookingCancelledClient: 'booking_cancelled_client',
  BookingCancelledMaster: 'booking_cancelled_master',
} as const

export type NotifyTemplate = (typeof NotifyTemplate)[keyof typeof NotifyTemplate]

export const REMINDER_TEMPLATES = [
  NotifyTemplate.Reminder24hClient,
  NotifyTemplate.Reminder2hMaster,
] as const

export type ReminderTemplate = (typeof REMINDER_TEMPLATES)[number]

export function notifyDedupeKey(
  template: NotifyTemplate,
  bookingId: string,
): string {
  return `${template}:${bookingId}`
}

export function notifyJobId(
  template: NotifyTemplate,
  bookingId: string,
  userId: string,
): string {
  return `notify:${template}:${bookingId}:${userId}`
}

export type NotifyVisit = {
  serviceTitle: string
  masterDisplayName: string
  clientName: string
  startsAt: Date
  cancelReason?: string | null
}

function formatVisitWhen(startsAt: Date): string {
  return new Intl.DateTimeFormat('ru-BY', {
    timeZone: MASTER_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(startsAt)
}

export function renderNotifyText(
  template: NotifyTemplate,
  visit: NotifyVisit,
): string {
  const when = formatVisitWhen(visit.startsAt)

  if (template === NotifyTemplate.Reminder24hClient) {
    return `Напоминание о записи: ${visit.serviceTitle} у ${visit.masterDisplayName}, ${when}.`
  }

  if (template === NotifyTemplate.Reminder2hMaster) {
    return `Через 2 часа запись: ${visit.clientName}, ${visit.serviceTitle}, ${when}.`
  }

  if (template === NotifyTemplate.BookingCancelledClient) {
    const reason = visit.cancelReason?.trim()
      ? ` Причина: ${visit.cancelReason.trim()}.`
      : ''

    return `Мастер отменил запись: ${visit.serviceTitle}, ${when}.${reason}`
  }

  return `Клиент отменил запись: ${visit.serviceTitle}, ${when}.`
}
