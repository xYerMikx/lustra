import { Inject, Injectable } from '@nestjs/common'
import type {
  AvailabilityQuery,
  AvailabilityResponse,
} from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'
import { ClockService } from '@/common/time/clock.service'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import type { SchedulingStore } from '@/modules/scheduling/app/scheduling.ports'
import { buildBookableWindows } from '@/modules/scheduling/domain/build-availability-windows'
import {
  MASTER_TIMEZONE,
  addDaysYmd,
  eachYmd,
  maxYmd,
  minYmd,
  formatYmdInTimeZone,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'
import { SchedulingRepository } from '@/modules/scheduling/infra/scheduling.repository'

@Injectable()
export class GetAvailabilityUseCase {
  constructor(
    @Inject(SchedulingRepository)
    private readonly store: SchedulingStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
    private readonly clock: ClockService,
  ) {}

  async execute(
    masterId: string,
    query: AvailabilityQuery,
  ): Promise<AvailabilityResponse> {
    const exists = await this.store.findMasterExists(masterId)

    if (!exists) {
      throw new DomainError('NOT_FOUND', 'Мастер не найден')
    }

    const service = await this.store.findService(masterId, query.serviceId)

    if (!service || !service.isActive) {
      throw new DomainError('NOT_FOUND', 'Услуга не найдена')
    }

    const policy = await this.store.getPolicy(masterId)

    if (!policy) {
      throw new DomainError('NOT_FOUND', 'Политика бронирования не найдена')
    }

    if (
      policy.granularityMin !== 15 &&
      policy.granularityMin !== 30 &&
      policy.granularityMin !== 60
    ) {
      throw new DomainError('VALIDATION_FAILED', 'Некорректный шаг сетки')
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmd: query.from,
      toYmd: query.to,
    })

    const now = this.clock.now()
    const todayYmd = formatYmdInTimeZone(now, MASTER_TIMEZONE)
    const horizonEndYmd = addDaysYmd(todayYmd, policy.maxHorizonDays)
    const rangeStart = maxYmd(query.from, todayYmd)
    const rangeEnd = minYmd(query.to, horizonEndYmd)

    if (rangeStart > rangeEnd) {
      return {
        serviceId: service.id,
        durationMin: service.durationMin,
        granularityMin: policy.granularityMin,
        timezone: MASTER_TIMEZONE,
        days: eachYmd(query.from, query.to).map((date) => ({
          date,
          hasOpen: false,
          slots: [],
        })),
      }
    }

    const granules = await this.store.listOpenGranules(
      masterId,
      zonedLocalToUtc(rangeStart, 0, MASTER_TIMEZONE),
      zonedLocalToUtc(addDaysYmd(rangeEnd, 1), 0, MASTER_TIMEZONE),
    )

    const bufferAfterMin = service.bufferAfterMin + policy.bufferAfterMin
    const windows = buildBookableWindows({
      granules,
      durationMin: service.durationMin,
      bufferAfterMin,
      granularityMin: policy.granularityMin,
      now,
      minLeadTimeMin: policy.minLeadTimeMin,
      timeZone: MASTER_TIMEZONE,
    })

    const byDate = new Map<string, typeof windows>()

    for (const window of windows) {
      const list = byDate.get(window.dateYmd) ?? []
      list.push(window)
      byDate.set(window.dateYmd, list)
    }

    const days = eachYmd(query.from, query.to).map((date) => {
      const slots = (byDate.get(date) ?? []).map((window) => ({
        startsAt: window.startsAt.toISOString(),
        endsAt: window.endsAt.toISOString(),
        slotIds: window.slotIds,
      }))

      return {
        date,
        hasOpen: slots.length > 0,
        slots,
      }
    })

    return {
      serviceId: service.id,
      durationMin: service.durationMin,
      granularityMin: policy.granularityMin,
      timezone: MASTER_TIMEZONE,
      days,
    }
  }
}
