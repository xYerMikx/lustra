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
import type { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
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
    process.env.TELEGRAM_BOT_USERNAME = 'lumira_test_bot'

    const result = await useCase.execute(user)

    process.env.TELEGRAM_BOT_USERNAME = previous

    expect(result.deepLink.startsWith('https://t.me/lumira_test_bot?start=')).toBe(
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
    const users = {
      findById: vi.fn().mockResolvedValue({ role: 'client' }),
    }
    const useCase = new HandleTelegramUpdateUseCase(
      tokens as unknown as AuthTokenRepository,
      accounts as unknown as TelegramAccountRepository,
      createTransactions(),
      new FixedClock(new Date('2026-08-20T12:00:00.000Z')),
      telegram,
      users as unknown as AuthUserRepository,
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
      undefined,
    )
  })

  it('invites the user to Lumira when /start has no payload', async () => {
    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new HandleTelegramUpdateUseCase(
      { findByHash: vi.fn() } as unknown as AuthTokenRepository,
      { upsertLink: vi.fn() } as unknown as TelegramAccountRepository,
      createTransactions(),
      new FixedClock(new Date('2026-08-20T12:00:00.000Z')),
      telegram,
      { findById: vi.fn() } as unknown as AuthUserRepository,
    )

    await useCase.execute({
      message: {
        text: '/start',
        chat: { id: 42 },
      },
    })

    expect(telegram.send).toHaveBeenCalledWith(
      '42',
      expect.stringContaining('откройте Lumira'),
      undefined,
    )
  })

  it('sends an open-app button when PUBLIC_APP_URL is https', async () => {
    const previous = process.env.PUBLIC_APP_URL
    process.env.PUBLIC_APP_URL = 'https://app.lumira.by'

    const telegram: TelegramSender = {
      send: vi.fn().mockResolvedValue({ kind: 'sent' }),
    }
    const useCase = new HandleTelegramUpdateUseCase(
      { findByHash: vi.fn() } as unknown as AuthTokenRepository,
      { upsertLink: vi.fn() } as unknown as TelegramAccountRepository,
      createTransactions(),
      new FixedClock(new Date('2026-08-20T12:00:00.000Z')),
      telegram,
      { findById: vi.fn() } as unknown as AuthUserRepository,
    )

    await useCase.execute({
      message: {
        text: '/start',
        chat: { id: 42 },
      },
    })

    process.env.PUBLIC_APP_URL = previous

    expect(telegram.send).toHaveBeenCalledWith(
      '42',
      expect.stringContaining('откройте Lumira'),
      expect.objectContaining({
        buttons: [expect.objectContaining({ url: 'https://app.lumira.by/app' })],
      }),
    )
  })
})
