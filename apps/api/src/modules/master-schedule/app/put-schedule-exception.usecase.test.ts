import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { DeleteScheduleExceptionUseCase } from '@/modules/master-schedule/app/delete-schedule-exception.usecase'
import { PutScheduleExceptionUseCase } from '@/modules/master-schedule/app/put-schedule-exception.usecase'
import type { ScheduleExceptionStore } from '@/modules/master-schedule/app/schedule-exception.ports'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const currentUser = {
  id: 'u1',
  role: 'master' as const,
  email: 'master.smoke.1@example.com',
}

function buildExceptionStore(
  overrides: Partial<ScheduleExceptionStore> = {},
): ScheduleExceptionStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    list: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockResolvedValue({
      id: 'e1',
      masterId: 'm1',
      date: new Date('2026-08-15T00:00:00.000Z'),
      type: 'day_off',
      startMin: null,
      endMin: null,
      note: null,
    }),
    delete: vi.fn().mockResolvedValue(true),
    countBusySlotsInRange: vi.fn().mockResolvedValue(0),
    ...overrides,
  }
}

describe('PutScheduleExceptionUseCase', () => {
  it('upserts a day off and refreshes slots', async () => {
    const exceptions = buildExceptionStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 0 }),
    } as unknown as EnsureSlotsUseCase

    const useCase = new PutScheduleExceptionUseCase(exceptions, ensureSlots)
    const result = await useCase.execute(currentUser, '2026-08-15', {
      type: 'day_off',
    })

    expect(result.type).toBe('day_off')
    expect(result.date).toBe('2026-08-15')
    expect(exceptions.upsert).toHaveBeenCalledWith(
      'm1',
      '2026-08-15',
      expect.objectContaining({ type: 'day_off', startMin: null, endMin: null }),
    )
    expect(ensureSlots.execute).toHaveBeenCalledWith({
      masterId: 'm1',
      fromYmdDate: '2026-08-15',
      toYmdDate: '2026-08-15',
    })
  })

  it('rejects when booked slots would fall outside working hours', async () => {
    const exceptions = buildExceptionStore({
      countBusySlotsInRange: vi.fn().mockResolvedValue(1),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new PutScheduleExceptionUseCase(exceptions, ensureSlots)

    await expect(
      useCase.execute(currentUser, '2026-08-15', { type: 'day_off' }),
    ).rejects.toMatchObject({
      code: 'TIME_OVERLAP',
    } satisfies Partial<DomainError>)

    expect(exceptions.upsert).not.toHaveBeenCalled()
    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })
})

describe('DeleteScheduleExceptionUseCase', () => {
  it('deletes owned exception and refreshes slots', async () => {
    const exceptions = buildExceptionStore()
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 4 }),
    } as unknown as EnsureSlotsUseCase

    const useCase = new DeleteScheduleExceptionUseCase(exceptions, ensureSlots)

    await useCase.execute(currentUser, '2026-08-15')

    expect(exceptions.delete).toHaveBeenCalledWith('m1', '2026-08-15')
    expect(ensureSlots.execute).toHaveBeenCalled()
  })

  it('rejects deleting a missing exception', async () => {
    const exceptions = buildExceptionStore({
      delete: vi.fn().mockResolvedValue(false),
    })
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new DeleteScheduleExceptionUseCase(exceptions, ensureSlots)

    await expect(
      useCase.execute(currentUser, '2026-08-15'),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)

    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })
})
