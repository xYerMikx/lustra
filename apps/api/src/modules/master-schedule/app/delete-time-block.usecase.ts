import { Inject, Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { TimeBlockStore } from '@/modules/master-schedule/app/time-block.ports'
import { TimeBlockRepository } from '@/modules/master-schedule/infra/time-block.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  MASTER_TIMEZONE,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class DeleteTimeBlockUseCase {
  constructor(
    @Inject(TimeBlockRepository)
    private readonly blocks: TimeBlockStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(actor: AuthUser, blockId: string): Promise<void> {
    const masterId = await this.blocks.findMasterIdByUserId(actor.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const existing = await this.blocks.findById(blockId)

    if (!existing || existing.masterId !== masterId) {
      throw new DomainError('NOT_FOUND', 'Блок не найден')
    }

    const deleted = await this.blocks.delete(blockId, masterId)

    if (!deleted) {
      throw new DomainError('NOT_FOUND', 'Блок не найден')
    }

    const fromYmdDate = formatYmdDateInTimeZone(
      existing.startsAt,
      MASTER_TIMEZONE,
    )
    const toYmdDate = formatYmdDateInTimeZone(
      new Date(existing.endsAt.getTime() - 1),
      MASTER_TIMEZONE,
    )

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate,
      toYmdDate,
    })
  }
}
