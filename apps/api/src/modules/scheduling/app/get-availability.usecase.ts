import { Inject, Injectable } from '@nestjs/common'
import {
  isGranularityMin,
  type AvailabilityQuery,
  type AvailabilityResponse,
} from '@lumira/contracts'

import { DomainError } from '@/common/errors/domain-error'
import { ClockService } from '@/common/time/clock.service'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import type { SchedulingStore } from '@/modules/scheduling/app/scheduling.ports'
import { buildBookableWindows } from '@/modules/scheduling/domain/build-availability-windows'
import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  eachYmdDate,
  formatYmdDateInTimeZone,
  maxYmdDate,
  minYmdDate,
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
    const visible = await this.store.findMasterPubliclyVisible(masterId)

    if (!visible) {
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

    if (!isGranularityMin(policy.granularityMin)) {
      throw new DomainError('VALIDATION_FAILED', 'Некорректный шаг сетки')
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: query.from,
      toYmdDate: query.to,
    })

    const now = this.clock.now()
    const todayYmdDate = formatYmdDateInTimeZone(now, MASTER_TIMEZONE)
    const horizonEndYmdDate = addDaysToYmdDate(
      todayYmdDate,
      policy.maxHorizonDays,
    )
    const rangeStart = maxYmdDate(query.from, todayYmdDate)
    const rangeEnd = minYmdDate(query.to, horizonEndYmdDate)

    if (rangeStart > rangeEnd) {
      return {
        serviceId: service.id,
        durationMin: service.durationMin,
        granularityMin: policy.granularityMin,
        timezone: MASTER_TIMEZONE,
        days: eachYmdDate(query.from, query.to).map((date) => ({
          date,
          hasOpen: false,
          slots: [],
        })),
      }
    }

    const openTimeSlots = await this.store.listOpenTimeSlots(
      masterId,
      zonedLocalToUtc(rangeStart, 0, MASTER_TIMEZONE),
      zonedLocalToUtc(addDaysToYmdDate(rangeEnd, 1), 0, MASTER_TIMEZONE),
    )

    const bufferAfterMin = service.bufferAfterMin + policy.bufferAfterMin
    const windows = buildBookableWindows({
      openTimeSlots,
      durationMin: service.durationMin,
      bufferAfterMin,
      granularityMin: policy.granularityMin,
      now,
      minLeadTimeMin: policy.minLeadTimeMin,
      timeZone: MASTER_TIMEZONE,
    })

    const byDate = new Map<string, typeof windows>()

    for (const window of windows) {
      const list = byDate.get(window.ymdDate) ?? []
      list.push(window)
      byDate.set(window.ymdDate, list)
    }

    const days = eachYmdDate(query.from, query.to).map((date) => {
      const slots = (byDate.get(date) ?? []).map((window) => ({
        startsAt: window.startsAt.toISOString(),
        endsAt: window.endsAt.toISOString(),
        slotIds: window.slotIds,
        extraPayAmount: window.extraPayAmount,
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
