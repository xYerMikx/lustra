import { describe, expect, it, vi } from 'vitest'
import { Logger } from '@nestjs/common'

import type { PrismaTx, TransactionManager } from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { Mailer } from '@/modules/auth/app/mailer.port'
import { RequestPasswordResetUseCase } from '@/modules/auth/app/request-password-reset.usecase'
import { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
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

const activeUser = {
  id: 'u1',
  email: 'client.smoke.1@example.com',
  firstName: 'Анна',
  status: 'active',
  deletedAt: null,
}

describe('RequestPasswordResetUseCase', () => {
  it('returns ok without mailing when the email is unknown', async () => {
    const users = { findByEmail: vi.fn().mockResolvedValue(null) }
    const tokens = { invalidateUnused: vi.fn(), create: vi.fn() }
    const mailer = { sendPasswordReset: vi.fn() }

    const useCase = new RequestPasswordResetUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(
      useCase.execute({ email: 'nobody.smoke.1@example.com' }),
    ).resolves.toEqual({ ok: true })
    expect(tokens.create).not.toHaveBeenCalled()
    expect(mailer.sendPasswordReset).not.toHaveBeenCalled()
  })

  it('returns ok without mailing when the account is inactive', async () => {
    const users = {
      findByEmail: vi.fn().mockResolvedValue({ ...activeUser, status: 'blocked' }),
    }
    const tokens = { invalidateUnused: vi.fn(), create: vi.fn() }
    const mailer = { sendPasswordReset: vi.fn() }

    const useCase = new RequestPasswordResetUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ email: activeUser.email })).resolves.toEqual({
      ok: true,
    })
    expect(mailer.sendPasswordReset).not.toHaveBeenCalled()
  })

  it('creates a hashed token and sends mail for an active user', async () => {
    const users = { findByEmail: vi.fn().mockResolvedValue(activeUser) }
    const tokens = {
      invalidateUnused: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 't1' }),
    }
    const mailer = { sendPasswordReset: vi.fn().mockResolvedValue(undefined) }

    const useCase = new RequestPasswordResetUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute({ email: activeUser.email })).resolves.toEqual({
      ok: true,
    })
    expect(tokens.invalidateUnused).toHaveBeenCalledWith(
      'u1',
      'password_reset',
      now,
    )
    expect(tokens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        kind: 'password_reset',
        expiresAt: new Date('2026-08-13T13:00:00.000Z'),
      }),
    )
    expect(mailer.sendPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        to: activeUser.email,
        firstName: 'Анна',
        resetUrl: expect.stringMatching(/\/app\/reset\?token=/),
      }),
    )
  })

  it('still returns ok when the mailer fails', async () => {
    const log = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    const users = { findByEmail: vi.fn().mockResolvedValue(activeUser) }
    const tokens = {
      invalidateUnused: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 't1' }),
    }
    const mailer = {
      sendPasswordReset: vi.fn().mockRejectedValue(new Error('resend down')),
    }

    const useCase = new RequestPasswordResetUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    try {
      await expect(useCase.execute({ email: activeUser.email })).resolves.toEqual({
        ok: true,
      })
    } finally {
      log.mockRestore()
    }
  })
})
