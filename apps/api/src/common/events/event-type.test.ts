import { describe, expect, it } from 'vitest'

import { MASTER_MODERATE_AUDIT_ACTION } from '@/common/events/audit-action-type'
import {
  OutboxEventType,
  isOutboxEventType,
} from '@/common/events/outbox-event-type'

describe('event type catalogs', () => {
  it('exposes outbox types for subscribers', () => {
    expect(OutboxEventType.BookingCreatedManual).toBe('booking.created_manual')
    expect(isOutboxEventType('booking.cancelled')).toBe(true)
    expect(isOutboxEventType('booking.unknown')).toBe(false)
  })

  it('maps moderation actions to audit types', () => {
    expect(MASTER_MODERATE_AUDIT_ACTION.approve).toBe('master.moderate.approve')
    expect(MASTER_MODERATE_AUDIT_ACTION.ban).toBe('master.moderate.ban')
  })
})
