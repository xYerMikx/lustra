import { describe, expect, it } from 'vitest'

import { CreateManualBookingInputSchema } from './booking'

const base = {
  serviceId: '11111111-1111-4111-8111-111111111111',
  startsAt: '2026-08-20T10:00:00.000Z',
  clientName: 'Оля',
}

describe('CreateManualBookingInputSchema', () => {
  it('accepts Instagram nick without a phone', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'instagram',
      socialHandle: '@Olya.nails',
    })

    expect(parsed.phone).toBeUndefined()
    expect(parsed.socialHandle).toBe('Olya.nails')
  })

  it('accepts Telegram nick without a phone', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'telegram',
      socialHandle: 'olya_tg',
    })

    expect(parsed.socialHandle).toBe('olya_tg')
  })

  it('accepts a walk-in guest with only a name', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'walk_in',
    })

    expect(parsed.phone).toBeUndefined()
    expect(parsed.socialHandle).toBeUndefined()
  })

  it('requires a phone when the channel is phone', () => {
    const result = CreateManualBookingInputSchema.safeParse({
      ...base,
      channel: 'phone',
    })

    expect(result.success).toBe(false)
  })

  it('requires an Instagram handle for the instagram channel', () => {
    const result = CreateManualBookingInputSchema.safeParse({
      ...base,
      channel: 'instagram',
      phone: '+375291112233',
    })

    expect(result.success).toBe(false)
  })

  it('still accepts phone plus Instagram handle', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'instagram',
      phone: '+375 (29) 111-22-33',
      socialHandle: 'olya.nails',
    })

    expect(parsed.phone).toBe('+375291112233')
    expect(parsed.socialHandle).toBe('olya.nails')
  })
})
