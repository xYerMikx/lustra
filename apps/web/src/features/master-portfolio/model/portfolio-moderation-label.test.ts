import { describe, expect, it } from 'vitest'

import { portfolioModerationLabel } from '@/features/master-portfolio/model/portfolio-moderation-label'

describe('portfolioModerationLabel', () => {
  it('labels pending and rejected, hides approved', () => {
    expect(portfolioModerationLabel('pending')).toBe('На проверке')
    expect(portfolioModerationLabel('rejected')).toBe('Отклонено')
    expect(portfolioModerationLabel('approved')).toBeNull()
  })
})
