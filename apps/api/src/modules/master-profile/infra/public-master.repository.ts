import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/common/prisma/prisma.service'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import type { PublicMasterRecord } from '@/modules/master-profile/domain/map-public-master'

@Injectable()
export class PublicMasterRepository implements PublicMasterStore {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicBySlug(slug: string): Promise<PublicMasterRecord | null> {
    const row = await this.prisma.masterProfile.findFirst({
      where: {
        slug,
        status: { in: ['pending_review', 'published'] },
      },
      select: {
        id: true,
        slug: true,
        displayName: true,
        headline: true,
        bio: true,
        status: true,
        experienceSince: true,
        languages: true,
        locations: {
          select: {
            id: true,
            districtId: true,
            type: true,
            addressHint: true,
            isPrimary: true,
            district: {
              select: {
                id: true,
                name: true,
                slug: true,
                city: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }],
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            durationMin: true,
            price: true,
            priceMax: true,
            priceType: true,
            currency: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
        },
        contact: {
          select: {
            publicPhone: true,
            instagram: true,
            telegramUsername: true,
          },
        },
        stats: {
          select: {
            ratingAvg: true,
            ratingCount: true,
          },
        },
      },
    })

    return row
  }
}
