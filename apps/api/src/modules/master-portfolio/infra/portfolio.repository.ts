import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import type { Prisma } from '@lumira/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'

export type PortfolioMediaInput = {
  ownerUserId: string
  storageKey: string
  mimeType: string
  bytes: number
  width: number
  height: number
}

export type PortfolioItemCreateInput = {
  masterId: string
  mediaId: string
  serviceId?: string | null
  caption?: string | null
  sort: number
  isCover: boolean
}

export type PortfolioItemRecord = {
  id: string
  masterId: string
  mediaId: string
  serviceId: string | null
  caption: string | null
  sort: number
  isCover: boolean
  media: {
    storageKey: string
    width: number
    height: number
    mimeType: string
    moderation: 'pending' | 'approved' | 'rejected'
  }
}

const ITEM_INCLUDE = {
  media: {
    select: {
      storageKey: true,
      width: true,
      height: true,
      mimeType: true,
      moderation: true,
    },
  },
} satisfies Prisma.PortfolioItemInclude

@Injectable()
export class PortfolioRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tx: TransactionManager,
  ) {}

  findMasterIdByUserId(userId: string): Promise<string | null> {
    return this.client()
      .masterProfile.findUnique({
        where: { userId },
        select: { id: true },
      })
      .then((row) => row?.id ?? null)
  }

  countActive(masterId: string): Promise<number> {
    return this.client().portfolioItem.count({
      where: { masterId, deletedAt: null },
    })
  }

  listActive(masterId: string): Promise<PortfolioItemRecord[]> {
    return this.client().portfolioItem.findMany({
      where: { masterId, deletedAt: null },
      include: ITEM_INCLUDE,
      orderBy: [{ isCover: 'desc' }, { sort: 'asc' }, { createdAt: 'asc' }],
    })
  }

  findActiveForMaster(
    masterId: string,
    itemId: string,
  ): Promise<PortfolioItemRecord | null> {
    return this.client().portfolioItem.findFirst({
      where: { id: itemId, masterId, deletedAt: null },
      include: ITEM_INCLUDE,
    })
  }

  serviceBelongsToMaster(masterId: string, serviceId: string): Promise<boolean> {
    return this.client()
      .service.findFirst({
        where: { id: serviceId, masterId },
        select: { id: true },
      })
      .then((row) => row !== null)
  }

  async createItem(
    media: PortfolioMediaInput,
    item: Omit<PortfolioItemCreateInput, 'mediaId'>,
  ): Promise<PortfolioItemRecord> {
    const mediaId = randomUUID()

    await this.client().mediaAsset.create({
      data: {
        id: mediaId,
        ownerUserId: media.ownerUserId,
        purpose: 'portfolio',
        storageKey: media.storageKey,
        variants: {},
        mimeType: media.mimeType,
        bytes: media.bytes,
        width: media.width,
        height: media.height,
        moderation: 'pending',
      },
    })

    if (item.isCover) {
      await this.clearCover(item.masterId)
    }

    const created = await this.client().portfolioItem.create({
      data: {
        masterId: item.masterId,
        mediaId,
        serviceId: item.serviceId ?? null,
        caption: item.caption ?? null,
        sort: item.sort,
        isCover: item.isCover,
      },
      include: ITEM_INCLUDE,
    })

    await this.client().masterStats.upsert({
      where: { masterId: item.masterId },
      create: { masterId: item.masterId, portfolioCount: 1 },
      update: { portfolioCount: { increment: 1 } },
    })

    return created
  }

  async updateItem(
    masterId: string,
    itemId: string,
    data: {
      caption?: string | null
      serviceId?: string | null
      isCover?: boolean
      sort?: number
    },
  ): Promise<PortfolioItemRecord> {
    if (data.isCover === true) {
      await this.clearCover(masterId)
    }

    return this.client().portfolioItem.update({
      where: { id: itemId },
      data,
      include: ITEM_INCLUDE,
    })
  }

  async softDelete(masterId: string, item: PortfolioItemRecord): Promise<void> {
    const now = new Date()

    await this.client().portfolioItem.update({
      where: { id: item.id },
      data: { deletedAt: now, isCover: false },
    })

    await this.client().mediaAsset.update({
      where: { id: item.mediaId },
      data: { deletedAt: now },
    })

    await this.client().masterStats.update({
      where: { masterId },
      data: { portfolioCount: { decrement: 1 } },
    })

    if (!item.isCover) {
      return
    }

    const nextCover = await this.client().portfolioItem.findFirst({
      where: { masterId, deletedAt: null },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    })

    if (!nextCover) {
      return
    }

    await this.client().portfolioItem.update({
      where: { id: nextCover.id },
      data: { isCover: true },
    })
  }

  private clearCover(masterId: string) {
    return this.client().portfolioItem.updateMany({
      where: { masterId, isCover: true, deletedAt: null },
      data: { isCover: false },
    })
  }

  private client() {
    return this.tx.getClient()
  }
}
