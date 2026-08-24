import { describe, expect, it } from 'vitest'

import { buildManualFormDefaults } from '@/features/master-calendar/model/build-manual-form-defaults'

describe('buildManualFormDefaults', () => {
  const services = [{ id: 'svc1' }]

  it('prefills date and time from a slot instant', () => {
    const values = buildManualFormDefaults(
      '2026-08-21',
      '2026-08-20T10:00:00.000Z',
      services,
    )

    expect(values.date).toBe('2026-08-20')
    expect(values.startTime).toBe('13:00')
    expect(values.serviceId).toBe('svc1')
  })

  it('uses the calendar date when no slot is selected', () => {
    const values = buildManualFormDefaults('2026-08-21', null, services)

    expect(values.date).toBe('2026-08-21')
    expect(values.startTime).toBe('10:00')
  })

  it('prefills name, phone, handle and channel from a book client', () => {
    const values = buildManualFormDefaults('2026-08-21', null, services, {
      name: 'Анна',
      phone: '+375291112233',
      socialHandle: 'anna.nails',
      source: 'telegram',
    })

    expect(values.clientName).toBe('Анна')
    expect(values.phone).toBe('+375291112233')
    expect(values.socialHandle).toBe('anna.nails')
    expect(values.channel).toBe('telegram')
    expect(values.identityNetwork).toBe('telegram')
  })
})
