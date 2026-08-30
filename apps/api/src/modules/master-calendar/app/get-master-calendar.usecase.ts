import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterCalendarQuery,
  MasterCalendarView,
} from '@lumira/contracts'
import { isGranularityMin } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterCalendarStore } from '@/modules/master-calendar/app/master-calendar.ports'
import {
  toCalendarBlockView,
  toCalendarExceptionView,
  toCalendarSlotView,
} from '@/modules/master-calendar/app/master-calendar.ports'
import { MasterCalendarRepository } from '@/modules/master-calendar/infra/master-calendar.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class GetMasterCalendarUseCase {
  constructor(
    @Inject(MasterCalendarRepository)
    private readonly calendar: MasterCalendarStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: MasterCalendarQuery,
  ): Promise<MasterCalendarView> {
    const master = await this.calendar.findMasterByUserId(currentUser.id)

    if (!master) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    await this.ensureSlots.execute({
      masterId: master.id,
      fromYmdDate: query.from,
      toYmdDate: query.to,
    })

    const granularityMin = await this.calendar.getGranularityMin(master.id)

    if (granularityMin == null || !isGranularityMin(granularityMin)) {
      throw new DomainError('NOT_FOUND', 'Политика записи мастера не найдена')
    }

    const rangeFrom = zonedLocalToUtc(query.from, 0, master.timezone)
    const rangeTo = zonedLocalToUtc(
      addDaysToYmdDate(query.to, 1),
      0,
      master.timezone,
    )

    const [slots, blocks, exceptions] = await Promise.all([
      this.calendar.listSlots(master.id, rangeFrom, rangeTo),
      this.calendar.listBlocks(master.id, rangeFrom, rangeTo),
      this.calendar.listExceptions(master.id, query.from, query.to),
    ])

    return {
      timezone: master.timezone,
      granularityMin,
      from: query.from,
      to: query.to,
      slots: slots.map(toCalendarSlotView),
      blocks: blocks.map(toCalendarBlockView),
      exceptions: exceptions.map(toCalendarExceptionView),
    }
  }
}
