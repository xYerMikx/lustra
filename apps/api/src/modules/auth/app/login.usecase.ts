import { Injectable } from '@nestjs/common'
import type { LoginInput, AuthSessionResponse } from '@lustra/contracts'

import { DomainError } from '../../../common/errors/domain-error'
import { JwtTokenService } from '../../../common/auth/jwt-token.service'
import { toAuthUserView } from '../domain/map-auth-user'
import { AuthUserRepository } from '../infra/auth-user.repository'
import { PasswordHasher } from '../infra/password-hasher'
import { RefreshSessionRepository } from '../infra/refresh-session.repository'

export type LoginResult = AuthSessionResponse & {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtTokenService,
  ) {}

  async execute(
    input: LoginInput,
    meta: { ip?: string; userAgent?: string },
  ): Promise<LoginResult> {
    const user = await this.users.findByEmail(input.email)
    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new DomainError('UNAUTHENTICATED', 'Неверный email или пароль')
    }

    const ok = await this.passwords.verify(user.passwordHash, input.password)
    if (!ok) {
      throw new DomainError('UNAUTHENTICATED', 'Неверный email или пароль')
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

    return {
      user: toAuthUserView(user),
      accessToken,
      refreshToken: rawToken,
    }
  }
}
