import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { CreateTimeBlockUseCase } from '@/modules/master-schedule/app/create-time-block.usecase'
import type { TimeBlockStore } from '@/modules/master-schedule/app/time-block.ports'
import { DeleteTimeBlockUseCase } from '@/modules/master-schedule/app/delete-time-block.usecase'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const actor = { id: 'u1', role: 'master' as const, email: 'master.smoke.1@example.com' }

function buildBlockStore(
  overrides: Partial<TimeBlockStore> = {},
): TimeBlockStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    findById: vi.fn(),
    findOverlapping: vi.fn().mockResolvedValue(null),
    countBusySlotsInRange: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockResolvedValue({
      id: 'b1',
      masterId: 'm1',
      startsAt: new Date('2026-08-11T10:00:00.000Z'),
      endsAt: new Date('2026-08-11T11:00:00.000Z'),
      reason: 'lunch',
      note: null,
    }),
    delete: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}

describe('CreateTimeBlockUseCase', () => {
  it('creates a block for the JWT master and refreshes slots', async () => {
    const blocks = buildBlockStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase

    const useCase = new CreateTimeBlockUseCase(blocks, ensureSlots)

    const result = await useCase.execute(actor, {
      startsAt: '2026-08-11T10:00:00.000Z',
      endsAt: '2026-08-11T11:00:00.000Z',
      reason: 'lunch',
    })

    expect(result.id).toBe('b1')
    expect(result.reason).toBe('lunch')
    expect(blocks.create).toHaveBeenCalledWith(
      'm1',
      'u1',
      expect.objectContaining({ reason: 'lunch' }),
    )
    expect(ensureSlots.execute).toHaveBeenCalledWith(
      expect.objectContaining({ masterId: 'm1' }),
    )
  })

  it('rejects overlapping blocks', async () => {
    const blocks = buildBlockStore({
      findOverlapping: vi.fn().mockResolvedValue({
        id: 'b0',
        masterId: 'm1',
        startsAt: new Date('2026-08-11T09:30:00.000Z'),
        endsAt: new Date('2026-08-11T10:30:00.000Z'),
        reason: 'break',
        note: null,
      }),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new CreateTimeBlockUseCase(blocks, ensureSlots)

    await expect(
      useCase.execute(actor, {
        startsAt: '2026-08-11T10:00:00.000Z',
        endsAt: '2026-08-11T11:00:00.000Z',
        reason: 'lunch',
      }),
    ).rejects.toMatchObject({ code: 'TIME_OVERLAP' } satisfies Partial<DomainError>)

    expect(blocks.create).not.toHaveBeenCalled()
    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })

  it('rejects when held or booked slots overlap the block', async () => {
    const blocks = buildBlockStore({
      countBusySlotsInRange: vi.fn().mockResolvedValue(2),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new CreateTimeBlockUseCase(blocks, ensureSlots)

    await expect(
      useCase.execute(actor, {
        startsAt: '2026-08-11T10:00:00.000Z',
        endsAt: '2026-08-11T11:00:00.000Z',
        reason: 'personal',
      }),
    ).rejects.toMatchObject({ code: 'TIME_OVERLAP' } satisfies Partial<DomainError>)

    expect(blocks.create).not.toHaveBeenCalled()
  })
})

describe('DeleteTimeBlockUseCase', () => {
  it('deletes owned block and refreshes slots', async () => {
    const blocks = buildBlockStore({
      findById: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'm1',
        startsAt: new Date('2026-08-11T10:00:00.000Z'),
        endsAt: new Date('2026-08-11T11:00:00.000Z'),
        reason: 'lunch',
        note: null,
      }),
    })
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 4 }),
    } as unknown as EnsureSlotsUseCase

    const useCase = new DeleteTimeBlockUseCase(blocks, ensureSlots)

    await useCase.execute(actor, 'b1')

    expect(blocks.delete).toHaveBeenCalledWith('b1', 'm1')
    expect(ensureSlots.execute).toHaveBeenCalled()
  })

  it('rejects deleting another master block (IDOR)', async () => {
    const blocks = buildBlockStore({
      findById: vi.fn().mockResolvedValue({
        id: 'b1',
        masterId: 'other',
        startsAt: new Date('2026-08-11T10:00:00.000Z'),
        endsAt: new Date('2026-08-11T11:00:00.000Z'),
        reason: 'lunch',
        note: null,
      }),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new DeleteTimeBlockUseCase(blocks, ensureSlots)

    await expect(useCase.execute(actor, 'b1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)

    expect(blocks.delete).not.toHaveBeenCalled()
    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })
})
