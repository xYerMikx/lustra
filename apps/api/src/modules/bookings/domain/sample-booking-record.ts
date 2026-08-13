import type { BookingRecord } from '@/modules/bookings/domain/map-booking'

export function sampleBookingRecord(
  overrides: Partial<BookingRecord> = {},
): BookingRecord {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    masterId: '22222222-2222-2222-2222-222222222222',
    clientUserId: '33333333-3333-3333-3333-333333333333',
    serviceId: '44444444-4444-4444-4444-444444444444',
    serviceTitle: 'Маникюр',
    serviceDurationMin: 90,
    priceAmount: '50.00',
    currency: 'BYN',
    startsAt: new Date('2026-08-20T10:00:00.000Z'),
    endsAt: new Date('2026-08-20T11:30:00.000Z'),
    status: 'hold',
    holdExpiresAt: new Date('2026-08-12T10:10:00.000Z'),
    clientComment: null,
    confirmedAt: null,
    completedAt: null,
    review: null,
    masterNote: 'secret',
    masterDisplayName: 'Анна',
    addressHint: 'возле метро',
    addressExact: 'ул. Примерная, 1',
    clientName: 'Клиент',
    clientPhone: '+375291112233',
    clientNote: null,
    ...overrides,
  }
}
