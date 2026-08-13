import { describe, expect, it } from 'vitest'

import { autoModerateReview } from '@/modules/reviews/domain/auto-moderate-review'

describe('autoModerateReview', () => {
  it('publishes rating-only and clean text', () => {
    expect(autoModerateReview(null)).toBe('published')
    expect(autoModerateReview('Очень аккуратно, спасибо')).toBe('published')
  })

  it('holds reviews with links, contacts or spam', () => {
    expect(autoModerateReview('Смотрите https://spam.example')).toBe('pending_review')
    expect(autoModerateReview('Пишите на mail@example.com')).toBe('pending_review')
    expect(autoModerateReview('Телефон +375291112233')).toBe('pending_review')
    expect(autoModerateReview('Я в telegram @nails')).toBe('pending_review')
    expect(autoModerateReview('Промокод на скидку')).toBe('pending_review')
  })
})
