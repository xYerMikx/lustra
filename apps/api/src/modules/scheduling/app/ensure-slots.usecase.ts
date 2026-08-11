import { Inject, Injectable } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import type { SchedulingStore } from '@/modules/scheduling/app/scheduling.ports'
import { generateGranuleStarts } from '@/modules/scheduling/domain/generate-granules'
import {
  MASTER_TIMEZONE,
  addDaysYmd,
  formatYmdInTimeZone,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'
import { SchedulingRepository } from '@/modules/scheduling/infra/scheduling.repository'

export type EnsureSlotsInput = {
  masterId: string
  fromYmd: string
  toYmd: string
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
      this.store.listExceptions(input.masterId, input.fromYmd, input.toYmd),
      this.store.listBlocks(
        input.masterId,
        zonedLocalToUtc(input.fromYmd, 0, MASTER_TIMEZONE),
        zonedLocalToUtc(addDaysYmd(input.toYmd, 1), 0, MASTER_TIMEZONE),
      ),
    ])

    const starts = generateGranuleStarts({
      now,
      fromYmd: input.fromYmd,
      toYmd: input.toYmd,
      granularityMin: policy.granularityMin,
      maxHorizonDays: policy.maxHorizonDays,
      rules,
      exceptions,
      blocks,
      timeZone: MASTER_TIMEZONE,
    })

    const todayYmd = formatYmdInTimeZone(now, MASTER_TIMEZONE)
    const rangeFrom = zonedLocalToUtc(
      input.fromYmd < todayYmd ? todayYmd : input.fromYmd,
      0,
      MASTER_TIMEZONE,
    )
    const rangeTo = zonedLocalToUtc(
      addDaysYmd(input.toYmd, 1),
      0,
      MASTER_TIMEZONE,
    )

    await this.store.upsertOpenGranules(
      input.masterId,
      starts,
      policy.granularityMin,
    )
    await this.store.deleteMissingOpenGranules(
      input.masterId,
      rangeFrom,
      rangeTo,
      starts,
    )

    return { createdHint: starts.length }
  }
}
