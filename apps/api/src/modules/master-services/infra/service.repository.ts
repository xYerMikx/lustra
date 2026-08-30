import { Injectable } from '@nestjs/common'
import { Prisma } from '@lumira/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import type { ServiceWriteData, ServiceRecord } from '@/modules/master-services/domain/map-service'

const serviceInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
} satisfies Prisma.ServiceInclude

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.prisma.masterProfile
      .findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  listByMasterId(masterId: string): Promise<ServiceRecord[]> {
    return this.prisma.service.findMany({
      where: { masterId },
      include: serviceInclude,
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    })
  }

  findById(id: string): Promise<ServiceRecord | null> {
    return this.prisma.service.findUnique({
      where: { id },
      include: serviceInclude,
    })
  }

  async create(masterId: string, data: ServiceWriteData): Promise<ServiceRecord> {
    const maxSort = await this.prisma.service.aggregate({
      where: { masterId },
      _max: { sort: true },
    })
    const sort = (maxSort._max.sort ?? -1) + 1

    const created = await this.prisma.service.create({
      data: {
        masterId,
        ...data,
        sort,
      },
      include: serviceInclude,
    })

    await this.refreshMasterStats(masterId)

    return created
  }

  async update(
    serviceId: string,
    masterId: string,
    data: Partial<ServiceWriteData>,
  ): Promise<ServiceRecord> {
    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data,
      include: serviceInclude,
    })

    await this.refreshMasterStats(masterId)

    return updated
  }

  private async refreshMasterStats(masterId: string): Promise<void> {
    const active = await this.prisma.service.findMany({
      where: { masterId, isActive: true },
      select: { price: true, priceMax: true, priceType: true },
    })

    let priceMin: Prisma.Decimal | null = null
    let priceMax: Prisma.Decimal | null = null

    for (const service of active) {
      const low = service.price
      const high =
        service.priceType === 'range' && service.priceMax
          ? service.priceMax
          : service.price

      if (!priceMin || low.lt(priceMin)) {
        priceMin = low
      }

      if (!priceMax || high.gt(priceMax)) {
        priceMax = high
      }
    }

    await this.prisma.masterStats.update({
      where: { masterId },
      data: {
        servicesCount: active.length,
        priceMin,
        priceMax,
        recalculatedAt: new Date(),
      },
    })
  }
}
