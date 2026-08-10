import { randomBytes } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import type { Prisma, UserRole } from '@lustra/db'

import {
  PRIVACY_CONSENT_VERSION,
  TERMS_CONSENT_VERSION,
} from '../../../common/auth/cookie.constants'
import { PrismaService } from '../../../common/prisma/prisma.service'
import { buildMasterSlug } from '../domain/slugify'

export type AuthUserRecord = Prisma.UserGetPayload<{
  include: {
    telegram: { select: { id: true } }
    masterProfile: { select: { status: true } }
  }
}>

type CreateUserInput = {
  email: string
  passwordHash: string
  firstName: string
  role: Extract<UserRole, 'client' | 'master'>
  ip?: string
}

@Injectable()
export class AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        telegram: { select: { id: true } },
        masterProfile: { select: { status: true } },
      },
    })
  }

  findById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        telegram: { select: { id: true } },
        masterProfile: { select: { status: true } },
      },
    })
  }

  async createWithProfile(input: CreateUserInput): Promise<AuthUserRecord> {
    const suffix = randomBytes(3).toString('hex')
    const slug = buildMasterSlug(input.firstName, suffix)

    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        role: input.role,
        notifySetting: { create: {} },
        consents: {
          create: [
            { kind: 'terms', version: TERMS_CONSENT_VERSION, ip: input.ip },
            { kind: 'privacy', version: PRIVACY_CONSENT_VERSION, ip: input.ip },
          ],
        },
        ...(input.role === 'client'
          ? { clientProfile: { create: {} } }
          : {
              masterProfile: {
                create: {
                  slug,
                  displayName: input.firstName,
                  policy: { create: {} },
                  stats: { create: {} },
                },
              },
            }),
      },
      include: {
        telegram: { select: { id: true } },
        masterProfile: { select: { status: true } },
      },
    })
  }

  touchLastLogin(userId: string): Promise<unknown> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    })
  }
}
