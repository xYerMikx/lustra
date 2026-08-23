import { describe, expect, it } from 'vitest'

import {
  CLIENT_CANCEL_WARNING,
  MASTER_CANCEL_WARNING,
} from '@/features/booking-cabinets/model/cancel-warning-copy'

describe('cancel warning copy', () => {
  it('warns the client about trust and moderation', () => {
    expect(CLIENT_CANCEL_WARNING).toContain('рейтинг')
    expect(CLIENT_CANCEL_WARNING).toContain('модерация')
  })

  it('warns the master that a review depends on moderation', () => {
    expect(MASTER_CANCEL_WARNING).toContain('модерацией')
    expect(MASTER_CANCEL_WARNING).toContain('отзыв')
  })
})
