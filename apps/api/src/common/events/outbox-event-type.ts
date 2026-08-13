export const OutboxEventType = {
  BookingCreated: 'booking.created',
  BookingCreatedManual: 'booking.created_manual',
  BookingCancelled: 'booking.cancelled',
} as const

export type OutboxEventType =
  (typeof OutboxEventType)[keyof typeof OutboxEventType]

export const OUTBOX_EVENT_TYPES = Object.values(OutboxEventType)

export function isOutboxEventType(value: string): value is OutboxEventType {
  return (OUTBOX_EVENT_TYPES as string[]).includes(value)
}
