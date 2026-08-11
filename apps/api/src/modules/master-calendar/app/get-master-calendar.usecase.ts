import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterCalendarQuery,
  MasterCalendarView,
} from '@lustra/contracts'
import { isGranularityMin } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterCalendarStore } from '@/modules/master-calendar/app/master-calendar.ports'
import {
  toCalendarBlockView,
  toCalendarSlotView,
} from '@/modules/master-calendar/app/master-calendar.ports'
import { MasterCalendarRepository } from '@/modules/master-calendar/infra/master-calendar.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  MASTER_TIMEZONE,
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
    actor: AuthUser,
    query: MasterCalendarQuery,
  ): Promise<MasterCalendarView> {
    const masterId = await this.calendar.findMasterIdByUserId(actor.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: query.from,
      toYmdDate: query.to,
    })

    const granularityMin = await this.calendar.getGranularityMin(masterId)

    if (granularityMin == null || !isGranularityMin(granularityMin)) {
      throw new DomainError('NOT_FOUND', 'Политика записи мастера не найдена')
    }

    const rangeFrom = zonedLocalToUtc(query.from, 0, MASTER_TIMEZONE)
    const rangeTo = zonedLocalToUtc(
      addDaysToYmdDate(query.to, 1),
      0,
      MASTER_TIMEZONE,
    )

    const [slots, blocks] = await Promise.all([
      this.calendar.listSlots(masterId, rangeFrom, rangeTo),
      this.calendar.listBlocks(masterId, rangeFrom, rangeTo),
    ])

    return {
      timezone: MASTER_TIMEZONE,
      granularityMin,
      from: query.from,
      to: query.to,
      slots: slots.map(toCalendarSlotView),
      blocks: blocks.map(toCalendarBlockView),
    }
  }
}
