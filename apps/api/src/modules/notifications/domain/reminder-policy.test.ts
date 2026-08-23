import { describe, expect, it } from 'vitest'

import { MASTER_TIMEZONE, zonedLocalToUtc } from '@/modules/scheduling/domain/tz'
import {
  deferQuietHours,
  isQuietHours,
} from '@/modules/notifications/domain/quiet-hours'
import {
  clientReminderFireAt,
  masterReminderFireAt,
} from '@/modules/notifications/domain/reminder-fire-at'
import {
  NotifyTemplate,
  notifyDedupeKey,
  notifyJobId,
  renderNotifyText,
} from '@/modules/notifications/domain/notify-template'
import {
  parseTelegramStartNonce,
  telegramDeepLink,
} from '@/modules/notifications/domain/telegram-link'
import {
  readOutboxBookingId,
  shouldScheduleReminders,
} from '@/modules/notifications/domain/outbox-payload'

describe('quiet hours', () => {
  it('treats 23:00–07:00 Europe/Minsk as quiet', () => {
    const at2300 = zonedLocalToUtc('2026-08-20', 23 * 60, MASTER_TIMEZONE)
    const at0659 = zonedLocalToUtc('2026-08-21', 6 * 60 + 59, MASTER_TIMEZONE)
    const at0700 = zonedLocalToUtc('2026-08-21', 7 * 60, MASTER_TIMEZONE)
    const at2259 = zonedLocalToUtc('2026-08-20', 22 * 60 + 59, MASTER_TIMEZONE)

    expect(isQuietHours(at2300)).toBe(true)
    expect(isQuietHours(at0659)).toBe(true)
    expect(isQuietHours(at0700)).toBe(false)
    expect(isQuietHours(at2259)).toBe(false)
  })

  it('defers 23:00 fire time to 07:00 next morning', () => {
    const at2300 = zonedLocalToUtc('2026-08-20', 23 * 60, MASTER_TIMEZONE)
    const expected = zonedLocalToUtc('2026-08-21', 7 * 60, MASTER_TIMEZONE)

    expect(deferQuietHours(at2300).getTime()).toBe(expected.getTime())
  })
})

describe('client reminder fire at', () => {
  it('sends immediately on the same calendar day', () => {
    const bookedAt = zonedLocalToUtc('2026-08-21', 10 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 15 * 60, MASTER_TIMEZONE)

    expect(
      clientReminderFireAt({
        startsAt,
        bookedAt,
        now: bookedAt,
        applyQuietHours: true,
      })?.getTime(),
    ).toBe(bookedAt.getTime())
  })

  it('uses 24h lead and defers quiet hours to 07:00', () => {
    const bookedAt = zonedLocalToUtc('2026-08-20', 22 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 23 * 60, MASTER_TIMEZONE)
    const expected = zonedLocalToUtc('2026-08-21', 7 * 60, MASTER_TIMEZONE)

    expect(
      clientReminderFireAt({
        startsAt,
        bookedAt,
        now: bookedAt,
        applyQuietHours: true,
      })?.getTime(),
    ).toBe(expected.getTime())
  })

  it('skips when deferred time is not before the visit', () => {
    const bookedAt = zonedLocalToUtc('2026-08-21', 6 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 6 * 60 + 30, MASTER_TIMEZONE)

    expect(
      clientReminderFireAt({
        startsAt,
        bookedAt,
        now: bookedAt,
        applyQuietHours: true,
      }),
    ).toBeNull()
  })
})

describe('master reminder fire at', () => {
  it('fires two hours before the visit', () => {
    const now = zonedLocalToUtc('2026-08-21', 10 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 16 * 60, MASTER_TIMEZONE)
    const expected = zonedLocalToUtc('2026-08-21', 14 * 60, MASTER_TIMEZONE)

    expect(
      masterReminderFireAt({
        startsAt,
        now,
        applyQuietHours: true,
      })?.getTime(),
    ).toBe(expected.getTime())
  })

  it('defers a 2h reminder that lands in quiet hours to 07:00', () => {
    const now = zonedLocalToUtc('2026-08-20', 12 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 8 * 60, MASTER_TIMEZONE)
    const expected = zonedLocalToUtc('2026-08-21', 7 * 60, MASTER_TIMEZONE)

    expect(
      masterReminderFireAt({
        startsAt,
        now,
        applyQuietHours: true,
      })?.getTime(),
    ).toBe(expected.getTime())
  })

  it('skips when the 2h mark is already in the past', () => {
    const now = zonedLocalToUtc('2026-08-21', 15 * 60, MASTER_TIMEZONE)
    const startsAt = zonedLocalToUtc('2026-08-21', 16 * 60, MASTER_TIMEZONE)

    expect(
      masterReminderFireAt({
        startsAt,
        now,
        applyQuietHours: true,
      }),
    ).toBeNull()
  })
})

describe('notify helpers', () => {
  it('builds stable job and dedupe keys', () => {
    expect(notifyDedupeKey(NotifyTemplate.Reminder24hClient, 'b1')).toBe(
      'reminder_24h_client:b1',
    )
    expect(notifyJobId(NotifyTemplate.Reminder2hMaster, 'b1', 'u1')).toBe(
      'notify:reminder_2h_master:b1:u1',
    )
  })

  it('renders Russian copy with visit facts', () => {
    const startsAt = zonedLocalToUtc('2026-08-21', 15 * 60, MASTER_TIMEZONE)
    const text = renderNotifyText(NotifyTemplate.Reminder24hClient, {
      serviceTitle: 'Маникюр',
      masterDisplayName: 'Анна',
      clientName: 'Катя',
      startsAt,
    })

    expect(text).toContain('Маникюр')
    expect(text).toContain('Анна')
  })

  it('parses /start nonce and builds a deep link', () => {
    expect(parseTelegramStartNonce('/start abc_nonce')).toBe('abc_nonce')
    expect(parseTelegramStartNonce('/start')).toBeNull()
    expect(telegramDeepLink('@MyBot', 'n1')).toBe('https://t.me/MyBot?start=n1')
  })

  it('reads bookingId from outbox payload', () => {
    expect(readOutboxBookingId({ bookingId: 'b1' })).toBe('b1')
    expect(readOutboxBookingId({})).toBeNull()
    expect(shouldScheduleReminders('booking.confirmed')).toBe(true)
    expect(shouldScheduleReminders('booking.cancelled')).toBe(false)
  })
})
