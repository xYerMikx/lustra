import { Injectable } from '@nestjs/common'
import type { Prisma } from '@lustra/db'

import { PrismaService } from '@/common/prisma/prisma.service'
import type {
  PrimaryLocationInput,
  ProfileUpdateData,
} from '@/modules/master-profile/app/master-profile.ports'
import type { MasterProfileRecord } from '@/modules/master-profile/domain/map-master-profile'

const profileInclude = {
  locations: {
    orderBy: [{ isPrimary: 'desc' as const }, { id: 'asc' as const }],
    include: {
      district: {
        select: { id: true, name: true, slug: true, city: true },
      },
    },
  },
} satisfies Prisma.MasterProfileInclude

@Injectable()
export class MasterProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<MasterProfileRecord | null> {
    return this.prisma.masterProfile.findUnique({
      where: { userId },
      include: profileInclude,
    })
  }

  findById(masterId: string): Promise<MasterProfileRecord | null> {
    return this.prisma.masterProfile.findUnique({
      where: { id: masterId },
      include: profileInclude,
    })
  }

  isSlugTaken(slug: string, excludeMasterId?: string): Promise<boolean> {
    return this.prisma.masterProfile
      .findFirst({
        where: {
          slug,
          ...(excludeMasterId ? { id: { not: excludeMasterId } } : {}),
        },
        select: { id: true },
      })
      .then((row) => row !== null)
  }

  async updateProfile(
    masterId: string,
    data: ProfileUpdateData,
  ): Promise<MasterProfileRecord> {
    return this.prisma.masterProfile.update({
      where: { id: masterId },
      data,
      include: profileInclude,
    })
  }

  async upsertPrimaryLocation(
    masterId: string,
    input: PrimaryLocationInput,
  ): Promise<MasterProfileRecord> {
    const existing = await this.prisma.masterLocation.findFirst({
      where: { masterId, isPrimary: true },
      select: { id: true },
    })

    if (existing) {
      await this.prisma.masterLocation.update({
        where: { id: existing.id },
        data: {
          districtId: input.districtId,
          type: input.type,
          addressHint: input.addressHint ?? null,
        },
      })
    } else {
      await this.prisma.masterLocation.create({
        data: {
          masterId,
          districtId: input.districtId,
          type: input.type,
          addressHint: input.addressHint ?? null,
          isPrimary: true,
        },
      })
    }

    const profile = await this.findById(masterId)

    if (!profile) {
      throw new Error('Master profile missing after location upsert')
    }

    return profile
  }
}
