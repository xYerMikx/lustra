import { Inject, Injectable } from '@nestjs/common'
import {
  resolveCustomHoursIntervals,
  type PutScheduleExceptionInput,
  type ScheduleExceptionView,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ScheduleExceptionStore } from '@/modules/master-schedule/app/schedule-exception.ports'
import { busyRangesForException } from '@/modules/master-schedule/domain/busy-ranges-for-exception'
import { toScheduleExceptionView } from '@/modules/master-schedule/domain/map-schedule-exception'
import { ScheduleExceptionRepository } from '@/modules/master-schedule/infra/schedule-exception.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import { eachYmdDate } from '@/modules/scheduling/domain/tz'

const MAX_EXCEPTION_DAYS = 31

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

    const lastDate = input.untilDate ?? ymdDate

    if (lastDate < ymdDate) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Дата окончания периода не может быть раньше начала',
      )
    }

    const dates = eachYmdDate(ymdDate, lastDate)

    if (dates.length > MAX_EXCEPTION_DAYS) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `Период не длиннее ${MAX_EXCEPTION_DAYS} дней`,
      )
    }

    const intervals =
      input.type === 'custom_hours' ? resolveCustomHoursIntervals(input) : []
    const startMin = intervals[0]?.startMin ?? null
    const endMin = intervals[intervals.length - 1]?.endMin ?? null
    const storedIntervals = intervals.length > 1 ? intervals : null
    const granularityMin =
      input.type === 'custom_hours' ? (input.granularityMin ?? null) : null

    for (const date of dates) {
      const ranges = busyRangesForException({
        ymdDate: date,
        type: input.type,
        startMin,
        endMin,
        intervals: storedIntervals ?? intervals,
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
          { busySlots: busyCount, date },
        )
      }
    }

    let firstRecord = null as Awaited<
      ReturnType<ScheduleExceptionStore['upsert']>
    > | null

    for (const date of dates) {
      const record = await this.exceptions.upsert(masterId, date, {
        type: input.type,
        startMin: input.type === 'custom_hours' ? startMin : null,
        endMin: input.type === 'custom_hours' ? endMin : null,
        granularityMin,
        intervals: input.type === 'custom_hours' ? storedIntervals : null,
        note: input.note?.trim() ? input.note.trim() : null,
      })

      if (!firstRecord) {
        firstRecord = record
      }
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: ymdDate,
      toYmdDate: lastDate,
    })

    if (!firstRecord) {
      throw new DomainError('INTERNAL', 'Исключение не сохранилось')
    }

    return toScheduleExceptionView(firstRecord)
  }
}
