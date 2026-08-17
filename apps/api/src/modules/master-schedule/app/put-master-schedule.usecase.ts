import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterScheduleView,
  PutMasterScheduleInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  MasterScheduleStore,
  SchedulePolicyPatch,
} from '@/modules/master-schedule/app/master-schedule.ports'
import { assertAvailabilityRules } from '@/modules/master-schedule/domain/availability-rule-rules'
import {
  leadTimeHoursToMin,
  toMasterScheduleView,
} from '@/modules/master-schedule/domain/map-schedule'
import { ScheduleRepository } from '@/modules/master-schedule/infra/schedule.repository'

@Injectable()
export class PutMasterScheduleUseCase {
  constructor(
    @Inject(ScheduleRepository)
    private readonly schedule: MasterScheduleStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: PutMasterScheduleInput,
  ): Promise<MasterScheduleView> {
    const masterId = await this.schedule.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    assertAvailabilityRules(input.rules)

    const policyPatch = toPolicyPatch(input.policy)
    const { rules, policy } = await this.schedule.replaceRules(
      masterId,
      input.rules,
      policyPatch,
    )

    return toMasterScheduleView(rules, policy)
  }
}

function toPolicyPatch(
  policy: PutMasterScheduleInput['policy'],
): SchedulePolicyPatch | undefined {
  if (!policy) {
    return undefined
  }

  const patch: SchedulePolicyPatch = {}

  if (policy.granularityMin !== undefined) {
    patch.granularityMin = policy.granularityMin
  }

  if (policy.leadTimeHours !== undefined) {
    patch.minLeadTimeMin = leadTimeHoursToMin(policy.leadTimeHours)
  }

  if (policy.horizonDays !== undefined) {
    patch.maxHorizonDays = policy.horizonDays
  }

  if (Object.keys(patch).length === 0) {
    return undefined
  }

  return patch
}
