import { randomBytes } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import type { Prisma, UserRole } from '@lustra/db'

import {
  PRIVACY_CONSENT_VERSION,
  TERMS_CONSENT_VERSION,
} from '@/common/auth/cookie.constants'
import { PrismaService } from '@/common/prisma/prisma.service'
import { buildMasterSlug } from '@/modules/auth/domain/slugify'

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

const AUTH_USER_INCLUDE = {
  telegram: { select: { id: true } },
  masterProfile: { select: { status: true } },
} satisfies Prisma.UserInclude

function buildRoleProfileData(
  input: CreateUserInput,
  slug: string,
): Pick<Prisma.UserCreateInput, 'clientProfile' | 'masterProfile'> {
  if (input.role === 'client') {
    return {
      clientProfile: { create: {} },
    }
  }

  return {
    masterProfile: {
      create: {
        slug,
        displayName: input.firstName,
        policy: { create: {} },
        stats: { create: {} },
      },
    },
  }
}

function buildCreateUserData(input: CreateUserInput, slug: string): Prisma.UserCreateInput {
  const consents: Prisma.ConsentCreateWithoutUserInput[] = [
    { kind: 'terms', version: TERMS_CONSENT_VERSION, ip: input.ip },
    { kind: 'privacy', version: PRIVACY_CONSENT_VERSION, ip: input.ip },
  ]

  const roleProfile = buildRoleProfileData(input, slug)

  return {
    email: input.email,
    passwordHash: input.passwordHash,
    firstName: input.firstName,
    role: input.role,
    notifySetting: { create: {} },
    consents: { create: consents },
    ...roleProfile,
  }
}

@Injectable()
export class AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: AUTH_USER_INCLUDE,
    })
  }

  findById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: AUTH_USER_INCLUDE,
    })
  }

  async createWithProfile(input: CreateUserInput): Promise<AuthUserRecord> {
    const suffix = randomBytes(3).toString('hex')
    const slug = buildMasterSlug(input.firstName, suffix)
    const data = buildCreateUserData(input, slug)

    return this.prisma.user.create({
      data,
      include: AUTH_USER_INCLUDE,
    })
  }

  touchLastLogin(userId: string): Promise<unknown> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    })
  }
}
