import { Inject, Injectable } from '@nestjs/common'
import type {
  PutScheduleExceptionInput,
  ScheduleExceptionView,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ScheduleExceptionStore } from '@/modules/master-schedule/app/schedule-exception.ports'
import { busyRangesForException } from '@/modules/master-schedule/domain/busy-ranges-for-exception'
import { toScheduleExceptionView } from '@/modules/master-schedule/domain/map-schedule-exception'
import { ScheduleExceptionRepository } from '@/modules/master-schedule/infra/schedule-exception.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

@Injectable()
export class PutScheduleExceptionUseCase {
  constructor(
    @Inject(ScheduleExceptionRepository)
    private readonly exceptions: ScheduleExceptionStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    ymdDate: string,
    input: PutScheduleExceptionInput,
  ): Promise<ScheduleExceptionView> {
    const masterId = await this.exceptions.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const startMin = input.type === 'custom_hours' ? (input.startMin ?? null) : null
    const endMin = input.type === 'custom_hours' ? (input.endMin ?? null) : null
    const ranges = busyRangesForException({
      ymdDate,
      type: input.type,
      startMin,
      endMin,
    })

    let busyCount = 0

    for (const range of ranges) {
      busyCount += await this.exceptions.countBusySlotsInRange(
        masterId,
        range.startsAt,
        range.endsAt,
      )
    }

    if (busyCount > 0) {
      throw new DomainError(
        'TIME_OVERLAP',
        'На это время уже есть запись — сначала перенесите или отмените её',
        { busySlots: busyCount },
      )
    }

    const record = await this.exceptions.upsert(masterId, ymdDate, {
      type: input.type,
      startMin,
      endMin,
      note: input.note?.trim() ? input.note.trim() : null,
    })

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: ymdDate,
      toYmdDate: ymdDate,
    })

    return toScheduleExceptionView(record)
  }
}
