import { Injectable } from '@nestjs/common'
import type { MasterStatus, Prisma } from '@lustra/db'

import { PrismaService } from '@/common/prisma/prisma.service'

export type AdminMasterRecord = {
  id: string
  slug: string
  displayName: string
  status: MasterStatus
  updatedAt: Date
  locations: Array<{
    isPrimary: boolean
    district: { name: string }
  }>
}

export type AuditLogInput = {
  actorId: string
  action: string
  entity: string
  entityId: string
  payload?: Prisma.InputJsonValue
  ip?: string
}

@Injectable()
export class AdminModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByStatus(status: MasterStatus, limit: number): Promise<AdminMasterRecord[]> {
    return this.prisma.masterProfile.findMany({
      where: { status },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  findById(masterId: string): Promise<AdminMasterRecord | null> {
    return this.prisma.masterProfile.findUnique({
      where: { id: masterId },
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  async updateStatus(
    masterId: string,
    data: {
      status: MasterStatus
      publishedAt?: Date | null
    },
  ): Promise<AdminMasterRecord> {
    return this.prisma.masterProfile.update({
      where: { id: masterId },
      data: {
        status: data.status,
        ...(data.publishedAt !== undefined
          ? { publishedAt: data.publishedAt }
          : {}),
      },
      select: {
        id: true,
        slug: true,
        displayName: true,
        status: true,
        updatedAt: true,
        locations: {
          where: { isPrimary: true },
          take: 1,
          select: {
            isPrimary: true,
            district: { select: { name: true } },
          },
        },
      },
    })
  }

  writeAuditLog(input: AuditLogInput): Promise<unknown> {
    return this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorType: 'admin',
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        payload: input.payload,
        ip: input.ip,
      },
    })
  }
}
