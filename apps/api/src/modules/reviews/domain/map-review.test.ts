import { describe, expect, it } from 'vitest'

import { toPublicReviewView } from '@/modules/reviews/domain/map-review'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const record: ReviewRecord = {
  id: 'r1',
  bookingId: 'b1',
  masterId: 'm1',
  rating: 5,
  text: 'Ок',
  status: 'published',
  createdAt: new Date('2026-08-12T12:00:00.000Z'),
  masterReply: null,
  repliedAt: null,
  clientFirstName: '  ',
}

describe('toPublicReviewView', () => {
  it('uses a generic name when the client first name is empty', () => {
    const view = toPublicReviewView(record)

    expect(view.clientFirstName).toBe('Клиент')
    expect(view.verified).toBe(true)
  })
})
