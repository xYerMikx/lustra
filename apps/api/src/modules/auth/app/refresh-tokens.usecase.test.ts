import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { JwtTokenService } from '@/common/auth/jwt-token.service'
import { RefreshTokensUseCase } from '@/modules/auth/app/refresh-tokens.usecase'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import { RefreshSessionRepository } from '@/modules/auth/infra/refresh-session.repository'

describe('RefreshTokensUseCase', () => {
  it('revokes the whole family when a revoked refresh token is reused', async () => {
    const revokeFamily = vi.fn()
    const sessions = {
      findByTokenHash: vi.fn().mockResolvedValue({
        id: 's1',
        userId: 'u1',
        familyId: 'f1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      }),
      revokeFamily,
      rotate: vi.fn(),
      revoke: vi.fn(),
      create: vi.fn(),
    }
    const users = { findById: vi.fn() }
    const jwt = { signAccess: vi.fn() }

    const useCase = new RefreshTokensUseCase(
      users as unknown as AuthUserRepository,
      sessions as unknown as RefreshSessionRepository,
      jwt as unknown as JwtTokenService,
    )

    await expect(useCase.execute('stolen-token', {})).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    } satisfies Partial<DomainError>)
    expect(revokeFamily).toHaveBeenCalledWith('f1')
  })
})
