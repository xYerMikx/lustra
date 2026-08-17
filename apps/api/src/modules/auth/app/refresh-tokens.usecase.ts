import { Injectable } from '@nestjs/common'
import type { AuthSessionResponse } from '@lustra/contracts'

import { JwtTokenService } from '@/common/auth/jwt-token.service'
import { DomainError } from '@/common/errors/domain-error'
import { toAuthUserView } from '@/modules/auth/domain/map-auth-user'
import { REFRESH_ROTATE_RACE } from '@/modules/auth/domain/refresh-errors'
import { hashToken } from '@/modules/auth/domain/token-hash'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import {
  type CreatedRefreshSession,
  RefreshSessionRepository,
} from '@/modules/auth/infra/refresh-session.repository'

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

    let rotated: CreatedRefreshSession

    try {
      rotated = await this.sessions.rotate({
        current,
        ip: meta.ip,
        userAgent: meta.userAgent,
      })
    } catch (error: unknown) {
      if (error instanceof Error && error.message === REFRESH_ROTATE_RACE) {
        await this.sessions.revokeFamily(current.familyId)
        throw new DomainError('UNAUTHENTICATED', 'Обнаружено повторное использование токена')
      }

      throw error
    }

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
