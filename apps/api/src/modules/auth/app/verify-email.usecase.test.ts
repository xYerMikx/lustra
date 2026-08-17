import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import type { PrismaTx, TransactionManager } from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import { VerifyEmailUseCase } from '@/modules/auth/app/verify-email.usecase'
import {
  AUTH_TOKEN_ALREADY_USED,
  AuthTokenRepository,
} from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'

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
  kind: 'email_verify',
  usedAt: null,
  expiresAt: new Date('2026-08-14T12:00:00.000Z'),
}

describe('VerifyEmailUseCase', () => {
  it('rejects a missing token', async () => {
    const tokens = { findByHash: vi.fn().mockResolvedValue(null) }
    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      {} as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'missing' })).rejects.toMatchObject({
      code: 'INVALID_STATE',
      message: 'Ссылка недействительна или устарела',
    } satisfies Partial<DomainError>)
  })

  it('treats a used token as success when the email is already verified', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        ...validToken,
        usedAt: new Date('2026-08-13T11:30:00.000Z'),
      }),
    }
    const users = {
      findById: vi.fn().mockResolvedValue({ emailVerified: true }),
      markEmailVerified: vi.fn(),
    }
    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      users as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'spent' })).resolves.toEqual({ ok: true })
    expect(users.markEmailVerified).not.toHaveBeenCalled()
  })

  it('rejects a used token when the email is still unverified', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        ...validToken,
        usedAt: new Date('2026-08-13T11:30:00.000Z'),
      }),
    }
    const users = {
      findById: vi.fn().mockResolvedValue({ emailVerified: false }),
    }
    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      users as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'spent' })).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
  })

  it('rejects an expired unused token', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        ...validToken,
        expiresAt: new Date('2026-08-13T11:00:00.000Z'),
      }),
    }
    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      {} as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'stale' })).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
  })

  it('marks the token used and sets emailVerified', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue(validToken),
      markUsed: vi.fn().mockResolvedValue(undefined),
    }
    const users = { markEmailVerified: vi.fn().mockResolvedValue(undefined) }

    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      users as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'raw-token' })).resolves.toEqual({ ok: true })
    expect(tokens.markUsed).toHaveBeenCalledWith('tok-1', now)
    expect(users.markEmailVerified).toHaveBeenCalledWith('u1')
  })

  it('maps a used-token race to success when already verified', async () => {
    const tokens = {
      findByHash: vi.fn().mockResolvedValue(validToken),
      markUsed: vi.fn().mockRejectedValue(new Error(AUTH_TOKEN_ALREADY_USED)),
    }
    const users = {
      markEmailVerified: vi.fn(),
      findById: vi.fn().mockResolvedValue({ emailVerified: true }),
    }
    const useCase = new VerifyEmailUseCase(
      tokens as unknown as AuthTokenRepository,
      users as unknown as AuthUserRepository,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ token: 'raw-token' })).resolves.toEqual({ ok: true })
  })
})
