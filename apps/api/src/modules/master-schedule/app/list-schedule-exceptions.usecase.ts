import { Inject, Injectable } from '@nestjs/common'
import type {
  ListScheduleExceptionsQuery,
  ScheduleExceptionListResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ScheduleExceptionStore } from '@/modules/master-schedule/app/schedule-exception.ports'
import { toScheduleExceptionView } from '@/modules/master-schedule/domain/map-schedule-exception'
import { ScheduleExceptionRepository } from '@/modules/master-schedule/infra/schedule-exception.repository'

@Injectable()
export class ListScheduleExceptionsUseCase {
  constructor(
    @Inject(ScheduleExceptionRepository)
    private readonly exceptions: ScheduleExceptionStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: ListScheduleExceptionsQuery,
  ): Promise<ScheduleExceptionListResponse> {
    const masterId = await this.exceptions.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const items = await this.exceptions.list(masterId, query.from, query.to)

    return { items: items.map(toScheduleExceptionView) }
  }
}
