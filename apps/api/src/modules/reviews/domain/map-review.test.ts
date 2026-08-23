import { describe, expect, it } from 'vitest'

import {
  toPublicReviewView,
  toReceivedClientReviewView,
} from '@/modules/reviews/domain/map-review'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const record: ReviewRecord = {
  id: 'r1',
  bookingId: 'b1',
  masterId: 'm1',
  authorRole: 'client',
  serviceTitle: 'Маникюр',
  rating: 5,
  text: 'Ок',
  status: 'published',
  createdAt: new Date('2026-08-12T12:00:00.000Z'),
  masterReply: null,
  repliedAt: null,
  clientFirstName: '  ',
  masterDisplayName: 'Анна',
}

describe('toPublicReviewView', () => {
  it('uses a generic name when the client first name is empty', () => {
    const view = toPublicReviewView(record)

    expect(view.clientFirstName).toBe('Клиент')
    expect(view.serviceTitle).toBe('Маникюр')
    expect(view.verified).toBe(true)
  })
})

describe('toReceivedClientReviewView', () => {
  it('keeps a null rating for a comment-only master review', () => {
    const view = toReceivedClientReviewView({
      ...record,
      authorRole: 'master',
      rating: null,
      text: 'Тихий визит',
    })

    expect(view.rating).toBeNull()
    expect(view.masterDisplayName).toBe('Анна')
    expect(view.serviceTitle).toBe('Маникюр')
  })
})
