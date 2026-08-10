import { Injectable } from '@nestjs/common'
import type { RegisterInput, AuthSessionResponse } from '@lustra/contracts'
import { Prisma } from '@lustra/db'

import { DomainError } from '../../../common/errors/domain-error'
import { JwtTokenService } from '../../../common/auth/jwt-token.service'
import { assertPasswordPolicy } from '../domain/password-policy'
import { toAuthUserView } from '../domain/map-auth-user'
import { AuthUserRepository } from '../infra/auth-user.repository'
import { PasswordHasher } from '../infra/password-hasher'
import { RefreshSessionRepository } from '../infra/refresh-session.repository'

export type RegisterResult = AuthSessionResponse & {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtTokenService,
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

    let user
    try {
      user = await this.users.createWithProfile({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        role: input.role,
        ip: meta.ip,
      })
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new DomainError('VALIDATION_FAILED', 'Email уже зарегистрирован', {
          fieldErrors: { email: ['Email уже зарегистрирован'] },
        })
      }
      throw error
    }

    const { rawToken, session: _session } = await this.sessions.create({
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

    return {
      user: toAuthUserView(user),
      accessToken,
      refreshToken: rawToken,
    }
  }
}
