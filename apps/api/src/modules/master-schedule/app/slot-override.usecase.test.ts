import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { CloseScheduleSlotUseCase } from '@/modules/master-schedule/app/close-schedule-slot.usecase'
import { CreateExtraSlotUseCase } from '@/modules/master-schedule/app/create-extra-slot.usecase'
import { ReopenScheduleSlotUseCase } from '@/modules/master-schedule/app/reopen-schedule-slot.usecase'
import type {
  ScheduleSlotRecord,
  SlotOverrideStore,
} from '@/modules/master-schedule/app/slot-override.ports'

const currentUser = {
  id: 'u1',
  role: 'master' as const,
  email: 'master.smoke.1@example.com',
}

const openSlot: ScheduleSlotRecord = {
  id: 's1',
  masterId: 'm1',
  startsAt: new Date('2026-08-23T18:00:00.000Z'),
  endsAt: new Date('2026-08-23T18:30:00.000Z'),
  status: 'open',
  isExtra: false,
  extraPayAmount: null,
}

function buildStore(overrides: Partial<SlotOverrideStore> = {}): SlotOverrideStore {
  return {
    findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
    getPolicyGranularityMin: vi.fn().mockResolvedValue(30),
    getDayGranularityMin: vi.fn().mockResolvedValue(null),
    findSlotById: vi.fn().mockResolvedValue(openSlot),
    findSlotByStart: vi.fn().mockResolvedValue(null),
    closeOpenSlot: vi.fn().mockResolvedValue(true),
    reopenClosedSlot: vi.fn().mockResolvedValue(true),
    upsertExtraSlot: vi.fn().mockResolvedValue({
      ...openSlot,
      isExtra: true,
      extraPayAmount: '15.00',
    }),
    ...overrides,
  }
}

describe('CreateExtraSlotUseCase', () => {
  it('creates an extra-pay slot with the day step', async () => {
    const slots = buildStore()
    const useCase = new CreateExtraSlotUseCase(slots)
    const startsAt = '2026-08-23T18:00:00.000Z'

    await useCase.execute(currentUser, {
      startsAt,
      extraPayAmount: 15,
    })

    expect(slots.upsertExtraSlot).toHaveBeenCalledWith({
      masterId: 'm1',
      startsAt: new Date(startsAt),
      endsAt: new Date('2026-08-23T18:30:00.000Z'),
      extraPayAmount: '15.00',
    })
  })

  it('rejects extra slot when the granule is already booked', async () => {
    const slots = buildStore({
      findSlotByStart: vi.fn().mockResolvedValue({
        ...openSlot,
        status: 'booked',
      }),
    })
    const useCase = new CreateExtraSlotUseCase(slots)

    await expect(
      useCase.execute(currentUser, {
        startsAt: '2026-08-23T18:00:00.000Z',
        extraPayAmount: 15,
      }),
    ).rejects.toMatchObject({
      code: 'TIME_OVERLAP',
    } satisfies Partial<DomainError>)
  })
})

describe('CloseScheduleSlotUseCase', () => {
  it('closes an open slot', async () => {
    const slots = buildStore()
    const useCase = new CloseScheduleSlotUseCase(slots)

    await useCase.execute(currentUser, 's1')

    expect(slots.closeOpenSlot).toHaveBeenCalledWith('m1', 's1')
  })
})

describe('ReopenScheduleSlotUseCase', () => {
  it('reopens a closed slot', async () => {
    const slots = buildStore({
      findSlotById: vi.fn().mockResolvedValue({
        ...openSlot,
        status: 'closed',
      }),
    })
    const useCase = new ReopenScheduleSlotUseCase(slots)

    await useCase.execute(currentUser, 's1')

    expect(slots.reopenClosedSlot).toHaveBeenCalledWith('m1', 's1')
  })
})
