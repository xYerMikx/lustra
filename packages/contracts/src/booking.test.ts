import { describe, expect, it } from 'vitest'

import { CreateManualBookingInputSchema } from './booking'

const base = {
  serviceId: '11111111-1111-4111-8111-111111111111',
  startsAt: '2026-08-20T10:00:00.000Z',
  clientName: 'Оля',
  identityNetwork: 'instagram' as const,
  socialHandle: 'olya.nails',
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
    expect(parsed.identityNetwork).toBe('instagram')
  })

  it('accepts Telegram nick without a phone', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'telegram',
      identityNetwork: 'telegram',
      socialHandle: 'olya_tg',
    })

    expect(parsed.socialHandle).toBe('olya_tg')
  })

  it('accepts walk-in with a nick and no phone', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'walk_in',
    })

    expect(parsed.phone).toBeUndefined()
    expect(parsed.socialHandle).toBe('olya.nails')
  })

  it('accepts the phone channel without a number when a nick is set', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'phone',
    })

    expect(parsed.phone).toBeUndefined()
  })

  it('rejects a guest with only a name', () => {
    const result = CreateManualBookingInputSchema.safeParse({
      serviceId: base.serviceId,
      startsAt: base.startsAt,
      clientName: 'Оля',
      channel: 'walk_in',
      identityNetwork: 'instagram',
    })

    expect(result.success).toBe(false)
  })

  it('still accepts phone plus Instagram handle', () => {
    const parsed = CreateManualBookingInputSchema.parse({
      ...base,
      channel: 'instagram',
      phone: '+375 (29) 111-22-33',
    })

    expect(parsed.phone).toBe('+375291112233')
    expect(parsed.socialHandle).toBe('olya.nails')
  })
})
