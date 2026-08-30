import { Inject, Injectable } from '@nestjs/common'
import type { MasterScheduleView } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterScheduleStore } from '@/modules/master-schedule/app/master-schedule.ports'
import { toMasterScheduleView } from '@/modules/master-schedule/domain/map-schedule'
import { ScheduleRepository } from '@/modules/master-schedule/infra/schedule.repository'

@Injectable()
export class GetMasterScheduleUseCase {
  constructor(
    @Inject(ScheduleRepository)
    private readonly schedule: MasterScheduleStore,
  ) {}

  async execute(currentUser: AuthUser): Promise<MasterScheduleView> {
    const masterId = await this.schedule.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const { rules, policy } = await this.schedule.getSchedule(masterId)

    if (!policy) {
      throw new DomainError('NOT_FOUND', 'Политика бронирования не найдена')
    }

    return toMasterScheduleView(rules, policy)
  }
}
