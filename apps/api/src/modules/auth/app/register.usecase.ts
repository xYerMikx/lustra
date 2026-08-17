import { Injectable, Logger } from '@nestjs/common'
import type { RegisterInput, AuthSessionResponse } from '@lustra/contracts'
import { Prisma } from '@lustra/db'

import { JwtTokenService } from '@/common/auth/jwt-token.service'
import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { DomainError } from '@/common/errors/domain-error'
import { SendEmailVerifyUseCase } from '@/modules/auth/app/send-email-verify.usecase'
import { toAuthUserView } from '@/modules/auth/domain/map-auth-user'
import { assertPasswordPolicy } from '@/modules/auth/domain/password-policy'
import {
  type AuthUserRecord,
  AuthUserRepository,
} from '@/modules/auth/infra/auth-user.repository'
import { PasswordHasher } from '@/modules/auth/infra/password-hasher'
import { RefreshSessionRepository } from '@/modules/auth/infra/refresh-session.repository'

export type RegisterResult = AuthSessionResponse & {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name)

  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtTokenService,
    private readonly sendEmailVerify: SendEmailVerifyUseCase,
  ) {}

  async execute(
    input: RegisterInput,
    meta: { ip?: string; userAgent?: string },
  ): Promise<RegisterResult> {
    assertPasswordPolicy(input.password)

    const existing = await this.users.findByEmail(input.email)

    if (existing) {
      throw new DomainError('VALIDATION_FAILED', 'Email уже зарегистрирован', {
        fieldErrors: { email: ['Email уже зарегистрирован'] },
      })
    }

    const passwordHash = await this.passwords.hash(input.password)

    let user: AuthUserRecord

    try {
      user = await this.users.createWithProfile({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        role: input.role,
        ip: meta.ip,
      })
    } catch (error: unknown) {
      const isUniqueConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT

      if (isUniqueConflict) {
        throw new DomainError('VALIDATION_FAILED', 'Email уже зарегистрирован', {
          fieldErrors: { email: ['Email уже зарегистрирован'] },
        })
      }

      throw error
    }

    const { rawToken } = await this.sessions.create({
      userId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    })

    const accessToken = await this.jwt.signAccess({
      sub: user.id,
      role: user.role,
      email: user.email,
    })

    await this.users.touchLastLogin(user.id)

    try {
      await this.sendEmailVerify.execute(user.id)
    } catch (error) {
      this.logger.error(error, 'email verify send failed')
    }

    return {
      user: toAuthUserView(user),
      accessToken,
      refreshToken: rawToken,
    }
  }
}
