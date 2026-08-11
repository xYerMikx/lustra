import { Inject, Injectable } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import type { SchedulingStore } from '@/modules/scheduling/app/scheduling.ports'
import { generateSlotStarts } from '@/modules/scheduling/domain/generate-slot-starts'
import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'
import { SchedulingRepository } from '@/modules/scheduling/infra/scheduling.repository'

export type EnsureSlotsInput = {
  masterId: string
  fromYmdDate: string
  toYmdDate: string
}

@Injectable()
export class EnsureSlotsUseCase {
  constructor(
    @Inject(SchedulingRepository)
    private readonly store: SchedulingStore,
    private readonly clock: ClockService,
  ) {}

  async execute(input: EnsureSlotsInput): Promise<{ createdHint: number }> {
    const policy = await this.store.getPolicy(input.masterId)

    if (!policy) {
      return { createdHint: 0 }
    }

    const now = this.clock.now()
    const [rules, exceptions, blocks] = await Promise.all([
      this.store.listRules(input.masterId),
      this.store.listExceptions(
        input.masterId,
        input.fromYmdDate,
        input.toYmdDate,
      ),
      this.store.listBlocks(
        input.masterId,
        zonedLocalToUtc(input.fromYmdDate, 0, MASTER_TIMEZONE),
        zonedLocalToUtc(addDaysToYmdDate(input.toYmdDate, 1), 0, MASTER_TIMEZONE),
      ),
    ])

    const starts = generateSlotStarts({
      now,
      fromYmdDate: input.fromYmdDate,
      toYmdDate: input.toYmdDate,
      granularityMin: policy.granularityMin,
      maxHorizonDays: policy.maxHorizonDays,
      rules,
      exceptions,
      blocks,
      timeZone: MASTER_TIMEZONE,
    })

    const todayYmdDate = formatYmdDateInTimeZone(now, MASTER_TIMEZONE)
    const rangeFrom = zonedLocalToUtc(
      input.fromYmdDate < todayYmdDate ? todayYmdDate : input.fromYmdDate,
      0,
      MASTER_TIMEZONE,
    )
    const rangeTo = zonedLocalToUtc(
      addDaysToYmdDate(input.toYmdDate, 1),
      0,
      MASTER_TIMEZONE,
    )

    await this.store.upsertOpenTimeSlots(
      input.masterId,
      starts,
      policy.granularityMin,
    )
    await this.store.deleteMissingOpenTimeSlots(
      input.masterId,
      rangeFrom,
      rangeTo,
      starts,
    )

    return { createdHint: starts.length }
  }
}
