import { describe, expect, it, vi } from 'vitest'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  PrismaTx,
  TransactionManager,
} from '@/common/prisma/transaction-manager.service'
import { FixedClock } from '@/common/time/clock.service'
import type { ReviewStore } from '@/modules/reviews/app/reviews.ports'
import { CreateReviewUseCase } from '@/modules/reviews/app/create-review.usecase'
import type { ReviewRecord } from '@/modules/reviews/domain/map-review'

const currentUser: AuthUser = {
  id: 'c1',
  role: 'client',
  email: 'client.smoke.1@example.com',
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

function buildStore(overrides: Partial<ReviewStore> = {}): ReviewStore {
  return {
    findMasterIdByUserId: vi.fn(),
    findPublicMasterIdBySlug: vi.fn(),
    findBookingForReview: vi.fn().mockResolvedValue({
      id: 'b1',
      masterId: 'm1',
      clientUserId: 'c1',
      serviceTitle: 'Маникюр',
      status: 'completed',
      completedAt: new Date('2026-08-10T12:00:00.000Z'),
      hasClientReview: false,
      hasMasterReview: false,
    }),
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

describe('CreateReviewUseCase', () => {
  const clock = new FixedClock(new Date('2026-08-12T12:00:00.000Z'))

  it('publishes a clean review for the booking owner', async () => {
    const store = buildStore()
    const useCase = new CreateReviewUseCase(store, createTransactions(), clock)

    const result = await useCase.execute(currentUser, {
      bookingId: 'b1',
      rating: 5,
      text: 'Отлично',
    })

    expect(result.review.status).toBe('published')
    expect(result.review.verified).toBe(true)
    expect(store.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: 'b1',
        status: 'published',
        rating: 5,
        authorRole: 'client',
        serviceTitle: 'Маникюр',
      }),
    )
  })

  it('sends contact spam to moderation', async () => {
    const store = buildStore()
    const useCase = new CreateReviewUseCase(store, createTransactions(), clock)

    await useCase.execute(currentUser, {
      bookingId: 'b1',
      rating: 5,
      text: 'Пишите в telegram @spam',
    })

    expect(store.createReview).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending_review' }),
    )
  })

  it('rejects a review without a completed booking', async () => {
    const store = buildStore({
      findBookingForReview: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'c1',
        serviceTitle: 'Маникюр',
        status: 'confirmed',
        completedAt: null,
        hasClientReview: false,
        hasMasterReview: false,
      }),
    })
    const useCase = new CreateReviewUseCase(store, createTransactions(), clock)

    await expect(
      useCase.execute(currentUser, { bookingId: 'b1', rating: 5 }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
    } satisfies Partial<DomainError>)
    expect(store.createReview).not.toHaveBeenCalled()
  })

  it('hides another client booking as not found', async () => {
    const store = buildStore({
      findBookingForReview: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'm1',
        clientUserId: 'other',
        serviceTitle: 'Маникюр',
        status: 'completed',
        completedAt: new Date('2026-08-10T12:00:00.000Z'),
        hasClientReview: false,
        hasMasterReview: false,
      }),
    })
    const useCase = new CreateReviewUseCase(store, createTransactions(), clock)

    await expect(
      useCase.execute(currentUser, { bookingId: 'b1', rating: 5 }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
  })
})
