import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { ModerateMasterUseCase } from '@/modules/admin-moderation/app/moderate-master.usecase'
import type { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

describe('ModerateMasterUseCase', () => {
  const admin = {
    id: 'a1',
    role: 'admin' as const,
    email: 'admin@example.com',
  }

  it('forbids a non-admin user', async () => {
    const masters = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
      writeAuditLog: vi.fn(),
      listByStatus: vi.fn(),
    } as unknown as AdminModerationRepository

    const useCase = new ModerateMasterUseCase(masters)

    await expect(
      useCase.execute(
        { id: 'u1', role: 'master', email: 'm@example.com' },
        'm1',
        { action: 'approve' },
      ),
    ).rejects.toBeInstanceOf(DomainError)

    expect(masters.findById).not.toHaveBeenCalled()
  })

  it('approves and writes audit log', async () => {
    const now = new Date('2026-08-12T12:00:00.000Z')
    const masters = {
      findById: vi.fn().mockResolvedValue({
        id: 'm1',
        slug: 'anna',
        displayName: 'Anna',
        status: 'pending_review',
        updatedAt: now,
        locations: [],
      }),
      updateStatus: vi.fn().mockResolvedValue({
        id: 'm1',
        slug: 'anna',
        displayName: 'Anna',
        status: 'published',
        updatedAt: now,
        locations: [],
      }),
      writeAuditLog: vi.fn().mockResolvedValue({}),
      listByStatus: vi.fn(),
    } as unknown as AdminModerationRepository

    const useCase = new ModerateMasterUseCase(masters)
    const result = await useCase.execute(admin, 'm1', {
      action: 'approve',
      comment: 'ok',
    })

    expect(result.master.status).toBe('published')
    expect(masters.updateStatus).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({ status: 'published' }),
    )
    expect(masters.writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        currentUserId: 'a1',
        action: 'master.moderate.approve',
        entityId: 'm1',
      }),
    )
  })
})
