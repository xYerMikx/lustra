import { Inject, Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { SlotOverrideStore } from '@/modules/master-schedule/app/slot-override.ports'
import { SlotOverrideRepository } from '@/modules/master-schedule/infra/slot-override.repository'

@Injectable()
export class CloseScheduleSlotUseCase {
  constructor(
    @Inject(SlotOverrideRepository)
    private readonly slots: SlotOverrideStore,
  ) {}

  async execute(currentUser: AuthUser, slotId: string): Promise<void> {
    const masterId = await this.slots.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const slot = await this.slots.findSlotById(masterId, slotId)

    if (!slot) {
      throw new DomainError('NOT_FOUND', 'Слот не найден')
    }

    if (slot.status !== 'open') {
      throw new DomainError(
        'INVALID_STATE',
        'Убрать можно только свободный слот',
      )
    }

    const closed = await this.slots.closeOpenSlot(masterId, slotId)

    if (!closed) {
      throw new DomainError(
        'INVALID_STATE',
        'Слот только что заняли — обновите календарь',
      )
    }
  }
}
