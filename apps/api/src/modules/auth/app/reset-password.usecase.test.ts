import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import type { PrismaTx, TransactionManager } from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import { ResetPasswordUseCase } from '@/modules/auth/app/reset-password.usecase'
import {
  AUTH_TOKEN_ALREADY_USED,
  AuthTokenRepository,
} from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import { PasswordHasher } from '@/modules/auth/infra/password-hasher'
import { RefreshSessionRepository } from '@/modules/auth/infra/refresh-session.repository'

const unusedTx = {} as PrismaTx
const now = new Date('2026-08-13T12:00:00.000Z')

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as unknown as TransactionManager
}

const validToken = {
  id: 'tok-1',
  userId: 'u1',
  kind: 'password_reset',
  usedAt: null,
  expiresAt: new Date('2026-08-13T13:00:00.000Z'),
}

describe('ResetPasswordUseCase', () => {
  it('rejects a missing, used, or expired token with the same message', async () => {
    const tokens = { findByHash: vi.fn().mockResolvedValue(null) }
    const useCase = new ResetPasswordUseCase(
      tokens as unknown as AuthTokenRepository,
      {} as unknown as AuthUserRepository,
      {} as unknown as RefreshSessionRepository,
      { hash: vi.fn() } as unknown as PasswordHasher,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ token: 'missing', password: 'Password1!' }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
      message: 'Ссылка недействительна или устарела',
    } satisfies Partial<DomainError>)
  })

  it('rejects a used token', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        ...validToken,
        usedAt: new Date('2026-08-13T11:30:00.000Z'),
      }),
    }
    const useCase = new ResetPasswordUseCase(
      tokens as unknown as AuthTokenRepository,
      {} as unknown as AuthUserRepository,
      {} as unknown as RefreshSessionRepository,
      { hash: vi.fn() } as unknown as PasswordHasher,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ token: 'spent', password: 'Password1!' }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' } satisfies Partial<DomainError>)
  })

  it('rejects an expired token', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        ...validToken,
        expiresAt: new Date('2026-08-13T11:00:00.000Z'),
      }),
    }
    const useCase = new ResetPasswordUseCase(
      tokens as unknown as AuthTokenRepository,
      {} as unknown as AuthUserRepository,
      {} as unknown as RefreshSessionRepository,
      { hash: vi.fn() } as unknown as PasswordHasher,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ token: 'stale', password: 'Password1!' }),
    ).rejects.toMatchObject({ code: 'INVALID_STATE' } satisfies Partial<DomainError>)
  })

  it('updates the password, marks the token used, and revokes all sessions', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue(validToken),
      markUsed: vi.fn().mockResolvedValue(undefined),
    }
    const users = { updatePasswordHash: vi.fn().mockResolvedValue(undefined) }
    const sessions = { revokeAllForUser: vi.fn().mockResolvedValue(undefined) }
    const passwords = { hash: vi.fn().mockResolvedValue('hashed') }

    const useCase = new ResetPasswordUseCase(
      tokens as unknown as AuthTokenRepository,
      users as unknown as AuthUserRepository,
      sessions as unknown as RefreshSessionRepository,
      passwords as unknown as PasswordHasher,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ token: 'raw-token', password: 'Password1!' }),
    ).resolves.toEqual({ ok: true })
    expect(passwords.hash).toHaveBeenCalledWith('Password1!')
    expect(tokens.markUsed).toHaveBeenCalledWith('tok-1', now)
    expect(users.updatePasswordHash).toHaveBeenCalledWith('u1', 'hashed')
    expect(sessions.revokeAllForUser).toHaveBeenCalledWith('u1', now)
  })

  it('maps a used-token race to the same invalid link error', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue(validToken),
      markUsed: vi.fn().mockRejectedValue(new Error(AUTH_TOKEN_ALREADY_USED)),
    }
    const useCase = new ResetPasswordUseCase(
      tokens as unknown as AuthTokenRepository,
      { updatePasswordHash: vi.fn() } as unknown as AuthUserRepository,
      { revokeAllForUser: vi.fn() } as unknown as RefreshSessionRepository,
      { hash: vi.fn().mockResolvedValue('hashed') } as unknown as PasswordHasher,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ token: 'raw-token', password: 'Password1!' }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
  })
})
