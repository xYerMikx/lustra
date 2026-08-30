import { Prisma } from '@lumira/db'
import { Injectable } from '@nestjs/common'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { PrismaService } from '@/common/prisma/prisma.service'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'

@Injectable()
export class FavoriteRepository implements FavoriteStore {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, masterId: string): Promise<void> {
    try {
      await this.prisma.favorite.create({
        data: { userId, masterId },
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT
      ) {
        return
      }

      throw error
    }
  }

  async remove(userId: string, masterId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, masterId },
    })
  }

  async has(userId: string, masterId: string): Promise<boolean> {
    const row = await this.prisma.favorite.findUnique({
      where: {
        userId_masterId: { userId, masterId },
      },
      select: { userId: true },
    })

    return row !== null
  }

  async listMasterIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { masterId: true },
    })

    return rows.map((row) => row.masterId)
  }
}
