import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { ModeratePortfolioUseCase } from '@/modules/admin-moderation/app/moderate-portfolio.usecase'
import type { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

const admin = {
  id: 'a1',
  role: 'admin' as const,
  email: 'admin@example.com',
}

const pendingItem = {
  id: 'p1',
  caption: 'френч',
  createdAt: new Date('2026-08-13T12:00:00.000Z'),
  master: { id: 'm1', slug: 'anna', displayName: 'Анна' },
  media: { storageKey: 'u1/a.webp', moderation: 'pending' as const },
}

describe('ModeratePortfolioUseCase', () => {
  it('approves pending photo and writes audit log', async () => {
    const store = {
      findPortfolioById: vi.fn().mockResolvedValue(pendingItem),
      updatePortfolioModeration: vi.fn().mockResolvedValue({
        ...pendingItem,
        media: { ...pendingItem.media, moderation: 'approved' },
      }),
      writeAuditLog: vi.fn().mockResolvedValue({}),
    } as unknown as AdminModerationRepository

    const useCase = new ModeratePortfolioUseCase(store)
    const result = await useCase.execute(admin, 'p1', { action: 'approve' })

    expect(result.item.moderation).toBe('approved')
    expect(store.updatePortfolioModeration).toHaveBeenCalledWith(
      'p1',
      'approved',
    )
    expect(store.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'portfolio.moderate.approve',
        entityId: 'p1',
      }),
    )
  })

  it('forbids a non-admin user', async () => {
    const store = {
      findPortfolioById: vi.fn(),
    } as unknown as AdminModerationRepository

    const useCase = new ModeratePortfolioUseCase(store)

    await expect(
      useCase.execute(
        { id: 'u1', role: 'master', email: 'm@example.com' },
        'p1',
        { action: 'approve' },
      ),
    ).rejects.toBeInstanceOf(DomainError)

    expect(store.findPortfolioById).not.toHaveBeenCalled()
  })
})
