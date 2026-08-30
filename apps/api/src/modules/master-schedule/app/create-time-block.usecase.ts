import { Inject, Injectable } from '@nestjs/common'
import type {
  CreateTimeBlockInput,
  TimeBlockView,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import {
  PRISMA_ERROR,
  TIME_BLOCK_NO_OVERLAP,
} from '@/common/db/prisma-error-codes'
import { DomainError } from '@/common/errors/domain-error'
import type {
  TimeBlockRecord,
  TimeBlockStore,
} from '@/modules/master-schedule/app/time-block.ports'
import { toTimeBlockView } from '@/modules/master-schedule/domain/map-time-block'
import { TimeBlockRepository } from '@/modules/master-schedule/infra/time-block.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  MASTER_TIMEZONE,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class CreateTimeBlockUseCase {
  constructor(
    @Inject(TimeBlockRepository)
    private readonly blocks: TimeBlockStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateTimeBlockInput,
  ): Promise<TimeBlockView> {
    const masterId = await this.blocks.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const startsAt = new Date(input.startsAt)
    const endsAt = new Date(input.endsAt)

    const overlap = await this.blocks.findOverlapping(masterId, startsAt, endsAt)

    if (overlap) {
      throw new DomainError(
        'TIME_OVERLAP',
        'Интервал пересекается с существующим блоком',
      )
    }

    const busyCount = await this.blocks.countBusySlotsInRange(
      masterId,
      startsAt,
      endsAt,
    )

    if (busyCount > 0) {
      throw new DomainError(
        'TIME_OVERLAP',
        'На это время уже есть запись — сначала перенесите или отмените её',
        { busySlots: busyCount },
      )
    }

    let record: TimeBlockRecord

    try {
      record = await this.blocks.create(masterId, currentUser.id, {
        startsAt,
        endsAt,
        reason: input.reason,
        note: input.note,
      })
    } catch (error: unknown) {
      if (isBlockOverlapConstraint(error)) {
        throw new DomainError(
          'TIME_OVERLAP',
          'Интервал пересекается с существующим блоком',
        )
      }

      throw error
    }

    const fromYmdDate = formatYmdDateInTimeZone(startsAt, MASTER_TIMEZONE)
    const toYmdDate = formatYmdDateInTimeZone(
      new Date(endsAt.getTime() - 1),
      MASTER_TIMEZONE,
    )

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate,
      toYmdDate,
    })

    return toTimeBlockView(record)
  }
}

function isBlockOverlapConstraint(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const known = error as {
    code?: unknown
    meta?: { constraint?: unknown }
    message?: unknown
  }

  if (known.code !== PRISMA_ERROR.CONSTRAINT_FAILED) {
    return false
  }

  const constraint = known.meta?.constraint

  if (Array.isArray(constraint)) {
    return constraint.includes(TIME_BLOCK_NO_OVERLAP)
  }

  if (typeof constraint === 'string') {
    return constraint === TIME_BLOCK_NO_OVERLAP
  }

  return (
    typeof known.message === 'string' &&
    known.message.includes(TIME_BLOCK_NO_OVERLAP)
  )
}
