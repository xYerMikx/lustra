import type { Prisma } from '@lumira/db'
import type { SearchMastersQuery } from '@lumira/contracts'
import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/common/prisma/prisma.service'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import { catalogDayUtcRange } from '@/modules/master-profile/domain/catalog-day-range'
import type { CatalogMasterRecord } from '@/modules/master-profile/domain/map-catalog-master'
import type { PublicMasterRecord } from '@/modules/master-profile/domain/map-public-master'
import { catalogOrderBy } from '@/modules/master-profile/infra/catalog-order-by'

const CATALOG_CARD_SELECT = {
  id: true,
  slug: true,
  displayName: true,
  headline: true,
  boostPriority: true,
  locations: {
    select: {
      isPrimary: true,
      district: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' as const }],
  },
  services: {
    where: { isActive: true },
    select: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ sort: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  stats: {
    select: {
      ratingAvg: true,
      ratingCount: true,
      priceMin: true,
    },
  },
} satisfies Prisma.MasterProfileSelect

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
            website: true,
          },
        },
        stats: {
          select: {
            ratingAvg: true,
            ratingCount: true,
          },
        },
        portfolio: {
          where: {
            deletedAt: null,
            media: { deletedAt: null, moderation: 'approved' },
          },
          select: {
            id: true,
            serviceId: true,
            caption: true,
            sort: true,
            isCover: true,
            media: {
              select: {
                storageKey: true,
                width: true,
                height: true,
              },
            },
          },
          orderBy: [{ isCover: 'desc' }, { sort: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })

    return row
  }

  async findPublishedById(id: string): Promise<CatalogMasterRecord | null> {
    return this.prisma.masterProfile.findFirst({
      where: { id, status: 'published' },
      select: CATALOG_CARD_SELECT,
    })
  }

  async listPublishedByIds(ids: string[]): Promise<CatalogMasterRecord[]> {
    if (ids.length === 0) {
      return []
    }

    return this.prisma.masterProfile.findMany({
      where: {
        id: { in: ids },
        status: 'published',
      },
      select: CATALOG_CARD_SELECT,
    })
  }

  async searchPublished(
    query: SearchMastersQuery,
  ): Promise<CatalogMasterRecord[]> {
    const where: Prisma.MasterProfileWhereInput = {
      status: 'published',
    }

    if (query.category || query.service) {
      where.services = {
        some: {
          isActive: true,
          ...(query.category
            ? { category: { slug: query.category } }
            : {}),
          ...(query.service
            ? { title: { contains: query.service, mode: 'insensitive' } }
            : {}),
        },
      }
    }

    if (query.district?.length || query.locationType) {
      where.locations = {
        some: {
          ...(query.district?.length
            ? { district: { slug: { in: query.district } } }
            : {}),
          ...(query.locationType ? { type: query.locationType } : {}),
        },
      }
    }

    if (query.availableOn) {
      const day = catalogDayUtcRange(query.availableOn)
      where.slots = {
        some: {
          status: 'open',
          startsAt: { gte: day.start, lt: day.end },
        },
      }
    }

    const statsFilter: Prisma.MasterStatsWhereInput = {}

    if (query.priceMin != null || query.priceMax != null) {
      statsFilter.priceMin = {
        ...(query.priceMin != null ? { gte: query.priceMin } : {}),
        ...(query.priceMax != null ? { lte: query.priceMax } : {}),
      }
    }

    if (query.ratingMin != null) {
      statsFilter.ratingAvg = { gte: query.ratingMin }
    }

    if (Object.keys(statsFilter).length > 0) {
      where.stats = { is: statsFilter }
    }

    return this.prisma.masterProfile.findMany({
      where,
      select: CATALOG_CARD_SELECT,
      orderBy: catalogOrderBy(query.sort),
      take: 48,
    })
  }
}
