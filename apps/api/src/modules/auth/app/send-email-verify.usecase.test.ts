import { describe, expect, it, vi } from 'vitest'
import { Logger } from '@nestjs/common'

import type { PrismaTx, TransactionManager } from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { Mailer } from '@/modules/auth/app/mailer.port'
import { SendEmailVerifyUseCase } from '@/modules/auth/app/send-email-verify.usecase'
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
  email: 'master.smoke.1@example.com',
  firstName: 'Анна',
  status: 'active',
  deletedAt: null,
  emailVerified: false,
}

describe('SendEmailVerifyUseCase', () => {
  it('returns ok without mailing when the user is missing', async () => {
    const users = { findById: vi.fn().mockResolvedValue(null) }
    const tokens = { invalidateUnused: vi.fn(), create: vi.fn() }
    const mailer = { sendEmailVerify: vi.fn(), sendPasswordReset: vi.fn() }

    const useCase = new SendEmailVerifyUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute('u-missing')).resolves.toEqual({ ok: true })
    expect(tokens.create).not.toHaveBeenCalled()
    expect(mailer.sendEmailVerify).not.toHaveBeenCalled()
  })

  it('returns ok without mailing when email is already verified', async () => {
    const users = {
      findById: vi.fn().mockResolvedValue({ ...activeUser, emailVerified: true }),
    }
    const tokens = { invalidateUnused: vi.fn(), create: vi.fn() }
    const mailer = { sendEmailVerify: vi.fn(), sendPasswordReset: vi.fn() }

    const useCase = new SendEmailVerifyUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute(activeUser.id)).resolves.toEqual({ ok: true })
    expect(mailer.sendEmailVerify).not.toHaveBeenCalled()
  })

  it('creates a hashed token and sends mail for an unverified user', async () => {
    const users = { findById: vi.fn().mockResolvedValue(activeUser) }
    const tokens = {
      invalidateUnused: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 't1' }),
    }
    const mailer = {
      sendEmailVerify: vi.fn().mockResolvedValue(undefined),
      sendPasswordReset: vi.fn(),
    }

    const useCase = new SendEmailVerifyUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    await expect(useCase.execute(activeUser.id)).resolves.toEqual({ ok: true })
    expect(tokens.invalidateUnused).toHaveBeenCalledWith('u1', 'email_verify', now)
    expect(tokens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        kind: 'email_verify',
        expiresAt: new Date('2026-08-14T12:00:00.000Z'),
      }),
    )
    expect(mailer.sendEmailVerify).toHaveBeenCalledWith(
      expect.objectContaining({
        to: activeUser.email,
        firstName: 'Анна',
        verifyUrl: expect.stringMatching(/\/app\/verify\?token=/),
      }),
    )
  })

  it('still returns ok when the mailer fails', async () => {
    const log = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined)
    const users = { findById: vi.fn().mockResolvedValue(activeUser) }
    const tokens = {
      invalidateUnused: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({ id: 't1' }),
    }
    const mailer = {
      sendEmailVerify: vi.fn().mockRejectedValue(new Error('resend down')),
      sendPasswordReset: vi.fn(),
    }

    const useCase = new SendEmailVerifyUseCase(
      users as unknown as AuthUserRepository,
      tokens as unknown as AuthTokenRepository,
      mailer as Mailer,
      createTransactions(),
      new FixedClock(now),
    )

    try {
      await expect(useCase.execute(activeUser.id)).resolves.toEqual({ ok: true })
    } finally {
      log.mockRestore()
    }
  })
})
