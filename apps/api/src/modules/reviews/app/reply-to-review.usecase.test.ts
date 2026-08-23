import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { ReplyToReviewUseCase } from '@/modules/reviews/app/reply-to-review.usecase'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const currentUser: AuthUser = {
  id: 'u-master',
  role: 'master',
  email: 'master.smoke.1@example.com',
}

const unusedTx = {} as PrismaTx

function createTransactions(): TransactionManager {
  const transactions: Pick<TransactionManager, 'run' | 'getClient'> = {
    run: async <T>(work: (tx: PrismaTx) => Promise<T>) => work(unusedTx),
    getClient: () => unusedTx,
  }

  return transactions as unknown as TransactionManager
}

const published: ReviewRecord = {
  id: 'r1',
  bookingId: 'b1',
  masterId: 'm1',
  authorRole: 'client',
  serviceTitle: 'Маникюр',
  rating: 5,
  text: 'Отлично',
  status: 'published',
  createdAt: new Date('2026-08-12T12:00:00.000Z'),
  masterReply: null,
  repliedAt: null,
  clientFirstName: 'Анна',
  masterDisplayName: 'Анна',
}

const replied: ReviewRecord = {
  ...published,
  masterReply: 'Спасибо!',
  repliedAt: new Date('2026-08-13T12:00:00.000Z'),
}

function buildStore(overrides: Partial<ReviewStore> = {}): ReviewStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    findPublicMasterIdBySlug: vi.fn(),
    findBookingForReview: vi.fn(),
    findById: vi.fn().mockResolvedValue(published),
    createReview: vi.fn(),
    replyToReview: vi.fn().mockResolvedValue(replied),
    listPublishedByMasterId: vi.fn(),
    listForMaster: vi.fn(),
    listReceivedByClientUserId: vi.fn(),
    findClientRating: vi.fn(),
    ...overrides,
  }
}

describe('ReplyToReviewUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-13T12:00:00.000Z'))

  it('saves a first reply on the master review', async () => {
    const store = buildStore()
    const useCase = new ReplyToReviewUseCase(store, createTransactions(), clock)

    const result = await useCase.execute(currentUser, 'r1', { text: 'Спасибо!' })

    expect(result.review.masterReply).toBe('Спасибо!')
  })

  it('rejects a second reply', async () => {
    const store = buildStore({
      findById: vi.fn().mockResolvedValue(replied),
    })
    const useCase = new ReplyToReviewUseCase(store, createTransactions(), clock)

    await expect(
      useCase.execute(currentUser, 'r1', { text: 'Ещё раз' }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
    expect(store.replyToReview).not.toHaveBeenCalled()
  })

  it('hides another master review as not found', async () => {
    const store = buildStore({
      findById: vi.fn().mockResolvedValue({ ...published, masterId: 'other' }),
    })
    const useCase = new ReplyToReviewUseCase(store, createTransactions(), clock)

    await expect(
      useCase.execute(currentUser, 'r1', { text: 'Спасибо!' }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
  })

  it('hides a master-authored review as not found', async () => {
    const store = buildStore({
      findById: vi.fn().mockResolvedValue({ ...published, authorRole: 'master' }),
    })
    const useCase = new ReplyToReviewUseCase(store, createTransactions(), clock)

    await expect(
      useCase.execute(currentUser, 'r1', { text: 'Спасибо!' }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
    expect(store.replyToReview).not.toHaveBeenCalled()
  })
})
