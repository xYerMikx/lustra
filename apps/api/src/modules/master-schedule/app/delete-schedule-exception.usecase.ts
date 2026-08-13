import { Inject, Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ScheduleExceptionStore } from '@/modules/master-schedule/app/schedule-exception.ports'
import { ScheduleExceptionRepository } from '@/modules/master-schedule/infra/schedule-exception.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'

@Injectable()
export class DeleteScheduleExceptionUseCase {
  constructor(
    @Inject(ScheduleExceptionRepository)
    private readonly exceptions: ScheduleExceptionStore,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(currentUser: AuthUser, ymdDate: string): Promise<void> {
    const masterId = await this.exceptions.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const deleted = await this.exceptions.delete(masterId, ymdDate)

    if (!deleted) {
      throw new DomainError('NOT_FOUND', 'Исключение не найдено')
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: ymdDate,
      toYmdDate: ymdDate,
    })
  }
}
