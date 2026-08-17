import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { ModerateReviewUseCase } from '@/modules/admin-moderation/app/moderate-review.usecase'
import type { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

const admin = {
  id: 'a1',
  role: 'admin' as const,
  email: 'admin@example.com',
}

const pendingReview = {
  id: 'r1',
  rating: 5,
  text: 'супер',
  status: 'pending_review' as const,
  createdAt: new Date('2026-08-13T12:00:00.000Z'),
  masterId: 'm1',
  master: { slug: 'anna', displayName: 'Анна' },
  client: { firstName: 'Оля' },
}

describe('ModerateReviewUseCase', () => {
  it('approves a pending review and writes audit log', async () => {
    const store = {
      findReviewById: vi.fn().mockResolvedValue(pendingReview),
      updateReviewStatus: vi.fn().mockResolvedValue({
        ...pendingReview,
        status: 'published',
      }),
      writeAuditLog: vi.fn().mockResolvedValue({}),
    } as unknown as AdminModerationRepository

    const useCase = new ModerateReviewUseCase(store)
    const result = await useCase.execute(admin, 'r1', { action: 'approve' })

    expect(result.review.status).toBe('published')
    expect(store.updateReviewStatus).toHaveBeenCalledWith(
      'r1',
      'published',
      expect.any(Date),
    )
    expect(store.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'review.moderate.approve',
        entityId: 'r1',
      }),
    )
  })

  it('forbids a non-admin user', async () => {
    const store = {
      findReviewById: vi.fn(),
    } as unknown as AdminModerationRepository

    const useCase = new ModerateReviewUseCase(store)

    await expect(
      useCase.execute(
        { id: 'u1', role: 'client', email: 'c@example.com' },
        'r1',
        { action: 'approve' },
      ),
    ).rejects.toBeInstanceOf(DomainError)

    expect(store.findReviewById).not.toHaveBeenCalled()
  })
})
