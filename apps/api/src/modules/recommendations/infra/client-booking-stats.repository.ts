import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/common/prisma/prisma.service'
import type { ClientBookingStatsStore } from '@/modules/recommendations/app/recommendations.ports'
import type { CompletedClientBookingRow } from '@/modules/recommendations/domain/rank-service-recommendations'

@Injectable()
export class ClientBookingStatsRepository implements ClientBookingStatsStore {
  constructor(private readonly prisma: PrismaService) {}

  async listCompletedByClient(
    userId: string,
  ): Promise<CompletedClientBookingRow[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        clientUserId: userId,
        status: 'completed',
      },
      select: {
        serviceId: true,
        serviceTitle: true,
        completedAt: true,
        startsAt: true,
        master: {
          select: {
            id: true,
            slug: true,
            displayName: true,
          },
        },
        service: {
          select: {
            categoryId: true,
          },
        },
      },
    })

    return rows.map((row) => ({
      serviceId: row.serviceId,
      serviceTitle: row.serviceTitle,
      categoryId: row.service?.categoryId ?? null,
      completedAt: row.completedAt ?? row.startsAt,
      master: {
        id: row.master.id,
        slug: row.master.slug,
        displayName: row.master.displayName,
      },
    }))
  }
}
