import type { NotifyTemplate } from '@/modules/notifications/domain/notify-template'

export type NotificationQueueJob = {
  template: NotifyTemplate
  bookingId: string
  userId: string
}

export type NotificationQueue = {
  addTelegramSend(input: {
    jobId: string
    delayMs: number
    payload: NotificationQueueJob
  }): Promise<void>
  remove(jobId: string): Promise<void>
}

export const NOTIFICATION_QUEUE = Symbol('NOTIFICATION_QUEUE')

export type TelegramSendOutcome =
  | { kind: 'sent' }
  | { kind: 'skipped'; reason: string }
  | { kind: 'blocked' }
  | { kind: 'failed'; error: string }

export type TelegramInlineButton = {
  text: string
  url: string
}

export type TelegramSendOptions = {
  buttons?: TelegramInlineButton[]
}

export type TelegramSender = {
  send(
    chatId: string,
    text: string,
    options?: TelegramSendOptions,
  ): Promise<TelegramSendOutcome>
}

export const TELEGRAM_SENDER = Symbol('TELEGRAM_SENDER')

export type NotifyRecipient = {
  userId: string
  chatId: string | null
  isBlocked: boolean
  telegramEnabled: boolean
  reminder24hEnabled: boolean
  reminder2hEnabled: boolean
  quietHoursEnabled: boolean
}

export type NotifyBookingSnapshot = {
  id: string
  status: string
  startsAt: Date
  bookedAt: Date
  serviceTitle: string
  masterDisplayName: string
  clientName: string
  clientUserId: string | null
  masterUserId: string
  cancelReason: string | null
}

export type NotificationStore = {
  claimPending(limit: number, now: Date, leaseUntil: Date): Promise<
    Array<{ id: string; type: string; payload: unknown; attempts: number }>
  >
  markDone(id: string, now: Date): Promise<void>
  markRetry(input: {
    id: string
    attempts: number
    availableAt: Date
    lastError: string
    failed: boolean
  }): Promise<void>
  findBookingSnapshot(bookingId: string): Promise<NotifyBookingSnapshot | null>
  findRecipient(userId: string): Promise<NotifyRecipient | null>
  tryInsertLog(input: {
    userId: string
    template: NotifyTemplate
    bookingId: string
    dedupeKey: string
    jobId: string
  }): Promise<'inserted' | 'duplicate'>
  markLogSent(dedupeKey: string, now: Date): Promise<void>
  markLogSkipped(dedupeKey: string, error: string): Promise<void>
  markLogFailed(dedupeKey: string, error: string): Promise<void>
  markTelegramBlocked(userId: string): Promise<void>
}

export const NOTIFICATION_STORE = Symbol('NOTIFICATION_STORE')
