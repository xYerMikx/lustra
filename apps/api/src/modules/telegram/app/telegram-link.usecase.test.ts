import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import { StartTelegramLinkUseCase } from '@/modules/telegram/app/start-telegram-link.usecase'
import { HandleTelegramUpdateUseCase } from '@/modules/telegram/app/handle-telegram-update.usecase'
import type { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
import type { TelegramAccountRepository } from '@/modules/telegram/infra/telegram-account.repository'
import type { TelegramSender } from '@/modules/notifications/app/notifications.ports'
import { hashToken } from '@/modules/auth/domain/token-hash'

const user: AuthUser = {
  id: 'u1',
  role: 'client',
  email: 'client.smoke.1@example.com',
}

const unusedTx = {} as PrismaTx

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as TransactionManager
}

describe('StartTelegramLinkUseCase', () => {
  it('stores a hashed nonce and returns a deep link', async () => {
    const tokens = {
      invalidateUnused: vi.fn(),
      create: vi.fn(),
    }
    const useCase = new StartTelegramLinkUseCase(
      tokens as unknown as AuthTokenRepository,
      createTransactions(),
      new FixedClock(new Date('2026-08-20T12:00:00.000Z')),
    )

    const previous = process.env.TELEGRAM_BOT_USERNAME
    process.env.TELEGRAM_BOT_USERNAME = 'lustra_test_bot'

    const result = await useCase.execute(user)

    process.env.TELEGRAM_BOT_USERNAME = previous

    expect(result.deepLink.startsWith('https://t.me/lustra_test_bot?start=')).toBe(
      true,
    )
    expect(tokens.invalidateUnused).toHaveBeenCalledWith(
      'u1',
      'telegram_link',
      expect.any(Date),
    )
    expect(tokens.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        kind: 'telegram_link',
      }),
    )
  })
})

describe('HandleTelegramUpdateUseCase', () => {
  it('links chat id when /start nonce is valid', async () => {
    const nonce = 'abcNonce'
    const tokens = {
      findByHash: vi.fn().mockResolvedValue({
        id: 't1',
        userId: 'u1',
        usedAt: null,
        expiresAt: new Date('2026-08-20T13:00:00.000Z'),
      }),
      markUsed: vi.fn(),
    }
    const accounts = {
      upsertLink: vi.fn(),
    }
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new HandleTelegramUpdateUseCase(
      tokens as unknown as AuthTokenRepository,
      accounts as unknown as TelegramAccountRepository,
      createTransactions(),
      new FixedClock(new Date('2026-08-20T12:00:00.000Z')),
      telegram,
    )

    await useCase.execute({
      message: {
        text: `/start ${nonce}`,
        chat: { id: 42 },
        from: { username: 'katya' },
      },
    })

    expect(tokens.findByHash).toHaveBeenCalledWith(
      'telegram_link',
      hashToken(nonce),
    )
    expect(accounts.upsertLink).toHaveBeenCalledWith({
      userId: 'u1',
      chatId: 42n,
      username: 'katya',
    })
    expect(telegram.send).toHaveBeenCalledWith(
      '42',
      expect.stringContaining('подключён'),
    )
  })
})
