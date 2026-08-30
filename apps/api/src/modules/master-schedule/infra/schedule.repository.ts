import { Injectable } from '@nestjs/common'
import type { AvailabilityRuleInput } from '@lumira/contracts'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  MasterScheduleStore,
  SchedulePolicyPatch,
} from '@/modules/master-schedule/app/master-schedule.ports'
import type {
  SchedulePolicyRecord,
  ScheduleRuleRecord,
} from '@/modules/master-schedule/domain/map-schedule'

@Injectable()
export class ScheduleRepository implements MasterScheduleStore {
  constructor(private readonly prisma: PrismaService) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.prisma.masterProfile
      .findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  async getSchedule(masterId: string): Promise<{
    rules: ScheduleRuleRecord[]
    policy: SchedulePolicyRecord | null
  }> {
    const [rules, policy] = await Promise.all([
      this.prisma.availabilityRule.findMany({
        where: { masterId },
        select: { id: true, weekday: true, startMin: true, endMin: true },
        orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
      }),
      this.prisma.masterBookingPolicy.findUnique({
        where: { masterId },
        select: {
          granularityMin: true,
          minLeadTimeMin: true,
          maxHorizonDays: true,
        },
      }),
    ])

    return { rules, policy }
  }

  async replaceRules(
    masterId: string,
    rules: AvailabilityRuleInput[],
    policyPatch?: SchedulePolicyPatch,
  ): Promise<{
    rules: ScheduleRuleRecord[]
    policy: SchedulePolicyRecord
  }> {
    return this.prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({ where: { masterId } })

      if (rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: rules.map((rule) => ({
            masterId,
            weekday: rule.weekday,
            startMin: rule.startMin,
            endMin: rule.endMin,
          })),
        })
      }

      if (policyPatch && Object.keys(policyPatch).length > 0) {
        await tx.masterBookingPolicy.update({
          where: { masterId },
          data: policyPatch,
        })
      }

      const [savedRules, policy] = await Promise.all([
        tx.availabilityRule.findMany({
          where: { masterId },
          select: { id: true, weekday: true, startMin: true, endMin: true },
          orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
        }),
        tx.masterBookingPolicy.findUniqueOrThrow({
          where: { masterId },
          select: {
            granularityMin: true,
            minLeadTimeMin: true,
            maxHorizonDays: true,
          },
        }),
      ])

      return { rules: savedRules, policy }
    })
  }
}
