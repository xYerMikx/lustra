import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { GetMasterCalendarUseCase } from '@/modules/master-calendar/app/get-master-calendar.usecase'
import type { MasterCalendarStore } from '@/modules/master-calendar/app/master-calendar.ports'
import type { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

const actor = { id: 'u1', role: 'master' as const, email: 'master.smoke.1@example.com' }

describe('GetMasterCalendarUseCase', () => {
  it('returns slots and blocks for the JWT master after ensuring projection', async () => {
    const calendar: MasterCalendarStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      getGranularityMin: vi.fn().mockResolvedValue(30),
      listSlots: vi.fn().mockResolvedValue([
        {
          id: 's1',
          startsAt: new Date('2026-08-11T07:00:00.000Z'),
          endsAt: new Date('2026-08-11T07:30:00.000Z'),
          status: 'open',
        },
      ]),
      listBlocks: vi.fn().mockResolvedValue([
        {
          id: 'b1',
          startsAt: new Date('2026-08-11T10:00:00.000Z'),
          endsAt: new Date('2026-08-11T11:00:00.000Z'),
          reason: 'lunch',
          note: null,
        },
      ]),
    }
    const ensureSlots = {
      execute: vi.fn().mockResolvedValue({ createdHint: 2 }),
    } as unknown as EnsureSlotsUseCase

    const useCase = new GetMasterCalendarUseCase(calendar, ensureSlots)

    const result = await useCase.execute(actor, {
      from: '2026-08-11',
      to: '2026-08-11',
    })

    expect(ensureSlots.execute).toHaveBeenCalledWith({
      masterId: 'm1',
      fromYmdDate: '2026-08-11',
      toYmdDate: '2026-08-11',
    })
    expect(result.granularityMin).toBe(30)
    expect(result.slots).toHaveLength(1)
    expect(result.blocks[0]?.reason).toBe('lunch')
  })

  it('rejects when master profile is missing', async () => {
    const calendar: MasterCalendarStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue(null),
      getGranularityMin: vi.fn(),
      listSlots: vi.fn(),
      listBlocks: vi.fn(),
    }
    const ensureSlots = {
      execute: vi.fn(),
    } as unknown as EnsureSlotsUseCase

    const useCase = new GetMasterCalendarUseCase(calendar, ensureSlots)

    await expect(
      useCase.execute(actor, { from: '2026-08-11', to: '2026-08-11' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' } satisfies Partial<DomainError>)

    expect(ensureSlots.execute).not.toHaveBeenCalled()
  })
})
