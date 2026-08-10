import { Injectable } from '@nestjs/common'
import type { AuthSessionResponse } from '@lustra/contracts'

import { DomainError } from '../../../common/errors/domain-error'
import { JwtTokenService } from '../../../common/auth/jwt-token.service'
import { hashToken } from '../domain/token-hash'
import { toAuthUserView } from '../domain/map-auth-user'
import { AuthUserRepository } from '../infra/auth-user.repository'
import { RefreshSessionRepository } from '../infra/refresh-session.repository'

export type RefreshResult = AuthSessionResponse & {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly jwt: JwtTokenService,
  ) {}

  async execute(
    rawRefreshToken: string | undefined,
    meta: { ip?: string; userAgent?: string },
  ): Promise<RefreshResult> {
    if (!rawRefreshToken) {
      throw new DomainError('UNAUTHENTICATED', 'Нет refresh-сессии')
    }

    const tokenHash = hashToken(rawRefreshToken)
    const current = await this.sessions.findByTokenHash(tokenHash)
    if (!current) {
      throw new DomainError('UNAUTHENTICATED', 'Сессия недействительна')
    }

    if (current.revokedAt) {
      await this.sessions.revokeFamily(current.familyId)
      throw new DomainError('UNAUTHENTICATED', 'Обнаружено повторное использование токена')
    }

    if (current.expiresAt.getTime() <= Date.now()) {
      await this.sessions.revoke(current.id)
      throw new DomainError('UNAUTHENTICATED', 'Сессия истекла')
    }

    const user = await this.users.findById(current.userId)
    if (!user || user.status !== 'active' || user.deletedAt) {
      await this.sessions.revokeFamily(current.familyId)
      throw new DomainError('UNAUTHENTICATED', 'Пользователь недоступен')
    }

    const rotated = await this.sessions.rotate({
      current,
      ip: meta.ip,
      userAgent: meta.userAgent,
    })

    const accessToken = await this.jwt.signAccess({
      sub: user.id,
      role: user.role,
      email: user.email,
    })

    return {
      user: toAuthUserView(user),
      accessToken,
      refreshToken: rotated.rawToken,
    }
  }
}
