import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import type { MediaStorage } from '@/common/storage/media-storage.port'
import { CreatePortfolioItemUseCase } from '@/modules/master-portfolio/app/create-portfolio-item.usecase'
import type { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

const currentUser = {
  id: '11111111-1111-4111-8111-111111111111',
  role: 'master' as const,
  email: 'master@example.com',
}

function stubTx(run: TransactionManager['run'] = vi.fn()): TransactionManager {
  return { run } as unknown as TransactionManager
}

describe('CreatePortfolioItemUseCase', () => {
  it('rejects a non-master user', async () => {
    const useCase = new CreatePortfolioItemUseCase(
      {} as unknown as PortfolioRepository,
      {} as unknown as MediaStorage,
      stubTx(),
    )

    await expect(
      useCase.execute(
        { ...currentUser, role: 'client' },
        PNG_1X1,
        {},
      ),
    ).rejects.toBeInstanceOf(DomainError)
  })

  it('rejects when the 60 photo limit is reached', async () => {
    const portfolio = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      countActive: vi.fn().mockResolvedValue(60),
      serviceBelongsToMaster: vi.fn(),
      createItem: vi.fn(),
    } as unknown as PortfolioRepository

    const storage = { put: vi.fn(), read: vi.fn() } as unknown as MediaStorage
    const useCase = new CreatePortfolioItemUseCase(portfolio, storage, stubTx())

    await expect(useCase.execute(currentUser, PNG_1X1, {})).rejects.toMatchObject({
      code: 'LIMIT_EXCEEDED',
    })

    expect(storage.put).not.toHaveBeenCalled()
  })

  it('stores the file and creates the first item as cover', async () => {
    const created = {
      id: 'p1',
      masterId: 'm1',
      mediaId: 'media-1',
      serviceId: null,
      caption: null,
      sort: 0,
      isCover: true,
      media: {
        storageKey: 'u1/a.webp',
        width: 1,
        height: 1,
        mimeType: 'image/png',
        moderation: 'pending',
      },
    }

    const portfolio = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      countActive: vi.fn().mockResolvedValue(0),
      serviceBelongsToMaster: vi.fn(),
      createItem: vi.fn().mockResolvedValue(created),
    } as unknown as PortfolioRepository

    const storage = {
      put: vi.fn().mockResolvedValue(undefined),
      read: vi.fn(),
    } as unknown as MediaStorage
    const tx = stubTx(
      vi.fn(async (fn) => fn({} as unknown as PrismaTx)),
    )

    const useCase = new CreatePortfolioItemUseCase(portfolio, storage, tx)

    const result = await useCase.execute(currentUser, PNG_1X1, { caption: 'ногти' })

    expect(storage.put).toHaveBeenCalledOnce()
    expect(portfolio.createItem).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: currentUser.id,
        mimeType: 'image/png',
        width: 1,
        height: 1,
      }),
      expect.objectContaining({
        masterId: 'm1',
        caption: 'ногти',
        isCover: true,
      }),
    )
    expect(result.isCover).toBe(true)
    expect(result.width).toBe(1)
  })
})
