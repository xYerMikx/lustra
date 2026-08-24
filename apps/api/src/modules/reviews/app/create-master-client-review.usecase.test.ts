import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { CreateMasterClientReviewUseCase } from '@/modules/reviews/app/create-master-client-review.usecase'
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

const created: ReviewRecord = {
  id: 'r2',
  bookingId: 'b1',
  masterId: 'm1',
  authorRole: 'master',
  serviceTitle: 'Маникюр',
  rating: null,
  text: 'Клиент опоздала, но визит прошёл спокойно',
  status: 'published',
  createdAt: new Date('2026-08-12T12:00:00.000Z'),
  masterReply: null,
  repliedAt: null,
  clientFirstName: 'Анна',
  masterDisplayName: 'Мастер',
}

const completedBooking = {
  id: 'b1',
  masterId: 'm1',
  clientUserId: 'c1',
  serviceTitle: 'Маникюр',
  status: 'completed' as const,
  completedAt: new Date('2026-08-10T12:00:00.000Z'),
  hasClientReview: false,
  hasMasterReview: false,
}

function buildStore(overrides: Partial<ReviewStore> = {}): ReviewStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    findPublicMasterIdBySlug: vi.fn(),
    findBookingForReview: vi.fn().mockResolvedValue(completedBooking),
    findById: vi.fn(),
    createReview: vi.fn().mockResolvedValue(created),
    replyToReview: vi.fn(),
    listPublishedByMasterId: vi.fn(),
    listForMaster: vi.fn(),
    listReceivedByClientUserId: vi.fn(),
    findClientRating: vi.fn(),
    ...overrides,
  }
}

describe('CreateMasterClientReviewUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('publishes a comment-only review after the visit is completed', async () => {
    const store = buildStore()
    const useCase = new CreateMasterClientReviewUseCase(
      store,
      createTransactions(),
      clock,
    )

    const result = await useCase.execute(currentUser, {
      bookingId: 'b1',
      text: 'Клиент опоздала, но визит прошёл спокойно',
    })

    expect(result.review.rating).toBeNull()
    expect(result.review.verified).toBe(true)
    expect(store.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        authorRole: 'master',
        rating: null,
        serviceTitle: 'Маникюр',
        clientUserId: 'c1',
      }),
    )
  })

  it('rejects a guest booking without a client account', async () => {
    const store = buildStore({
      findBookingForReview: vi.fn().mockResolvedValue({
        ...completedBooking,
        clientUserId: null,
      }),
    })
    const useCase = new CreateMasterClientReviewUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(
      useCase.execute(currentUser, { bookingId: 'b1', rating: 5 }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
    expect(store.createReview).not.toHaveBeenCalled()
  })

  it('hides another master booking as not found', async () => {
    const store = buildStore({
      findBookingForReview: vi.fn().mockResolvedValue({
        ...completedBooking,
        masterId: 'other',
      }),
    })
    const useCase = new CreateMasterClientReviewUseCase(
      store,
      createTransactions(),
      clock,
    )

    await expect(
      useCase.execute(currentUser, { bookingId: 'b1', rating: 4 }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
  })
})
