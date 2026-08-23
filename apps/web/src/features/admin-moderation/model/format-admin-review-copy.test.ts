import { describe, expect, it } from 'vitest'

import {
  formatAdminReviewHeadline,
  formatAdminReviewMeta,
} from '@/features/admin-moderation/model/format-admin-review-copy'

describe('formatAdminReviewCopy', () => {
  it('builds a headline without nested separators', () => {
    expect(
      formatAdminReviewHeadline({
        authorRole: 'master',
        rating: null,
        clientFirstName: 'Анна',
      }),
    ).toBe('О клиенте · без оценки · Анна')
  })

  it('omits an empty service title from meta', () => {
    expect(
      formatAdminReviewMeta({
        serviceTitle: '  ',
        masterDisplayName: 'Анна',
      }),
    ).toBe('Анна')
  })
})
