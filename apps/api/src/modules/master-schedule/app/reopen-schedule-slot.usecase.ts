import { Inject, Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { SlotOverrideStore } from '@/modules/master-schedule/app/slot-override.ports'
import { SlotOverrideRepository } from '@/modules/master-schedule/infra/slot-override.repository'

@Injectable()
export class ReopenScheduleSlotUseCase {
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

    if (slot.status !== 'closed') {
      throw new DomainError('INVALID_STATE', 'Вернуть можно только снятый слот')
    }

    const opened = await this.slots.reopenClosedSlot(masterId, slotId)

    if (!opened) {
      throw new DomainError('INVALID_STATE', 'Не удалось вернуть слот')
    }
  }
}
