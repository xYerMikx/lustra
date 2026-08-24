import { Inject, Injectable } from '@nestjs/common'
import { isGranularityMin } from '@lustra/contracts'
import { Prisma } from '@lustra/db'
import type { CreateExtraSlotInput } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { isBookingRaceConstraint } from '@/modules/bookings/domain/booking-race'
import type { SlotOverrideStore } from '@/modules/master-schedule/app/slot-override.ports'
import { SlotOverrideRepository } from '@/modules/master-schedule/infra/slot-override.repository'
import {
  MASTER_TIMEZONE,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class CreateExtraSlotUseCase {
  constructor(
    @Inject(SlotOverrideRepository)
    private readonly slots: SlotOverrideStore,
  ) {}

  async execute(currentUser: AuthUser, input: CreateExtraSlotInput) {
    const masterId = await this.slots.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const startsAt = new Date(input.startsAt)
    const ymdDate = formatYmdDateInTimeZone(startsAt, MASTER_TIMEZONE)
    const dayGranularity = await this.slots.getDayGranularityMin(
      masterId,
      ymdDate,
    )
    const policyGranularity = await this.slots.getPolicyGranularityMin(masterId)
    const step = dayGranularity ?? policyGranularity

    if (step == null || !isGranularityMin(step)) {
      throw new DomainError('NOT_FOUND', 'Политика записи мастера не найдена')
    }

    const existing = await this.slots.findSlotByStart(masterId, startsAt)

    if (
      existing &&
      existing.status !== 'open' &&
      existing.status !== 'closed'
    ) {
      throw new DomainError(
        'TIME_OVERLAP',
        'На это время уже есть запись или блок',
      )
    }

    const extraPayAmount = input.extraPayAmount.toFixed(2)

    try {
      return await this.slots.upsertExtraSlot({
        masterId,
        startsAt,
        endsAt: new Date(startsAt.getTime() + step * 60_000),
        extraPayAmount,
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DomainError(
          'TIME_OVERLAP',
          'На это время уже есть запись или блок',
        )
      }

      if (isBookingRaceConstraint(error)) {
        throw new DomainError(
          'TIME_OVERLAP',
          'На это время уже есть запись или блок',
        )
      }

      throw error
    }
  }
}
