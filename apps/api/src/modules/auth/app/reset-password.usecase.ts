import { Injectable } from '@nestjs/common'
import type { OkResponse, ResetPasswordInput } from '@lumira/contracts'

import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import { assertPasswordPolicy } from '@/modules/auth/domain/password-policy'
import { hashToken } from '@/modules/auth/domain/token-hash'
import { AuthTokenRepository, AUTH_TOKEN_ALREADY_USED } from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import { PasswordHasher } from '@/modules/auth/infra/password-hasher'
import { RefreshSessionRepository } from '@/modules/auth/infra/refresh-session.repository'

const INVALID_LINK = 'Ссылка недействительна или устарела'

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly tokens: AuthTokenRepository,
    private readonly users: AuthUserRepository,
    private readonly sessions: RefreshSessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<OkResponse> {
    assertPasswordPolicy(input.password)

    const now = this.clock.now()
    const token = await this.tokens.findByHash('password_reset', hashToken(input.token))

    if (
      !token ||
      !token.userId ||
      token.usedAt ||
      token.expiresAt.getTime() <= now.getTime()
    ) {
      throw DomainError.invalidState(INVALID_LINK)
    }

    const passwordHash = await this.passwords.hash(input.password)
    const userId = token.userId

    try {
      await this.tx.run(async () => {
        await this.tokens.markUsed(token.id, now)
        await this.users.updatePasswordHash(userId, passwordHash)
        await this.sessions.revokeAllForUser(userId, now)
      })
    } catch (error) {
      if (error instanceof Error && error.message === AUTH_TOKEN_ALREADY_USED) {
        throw DomainError.invalidState(INVALID_LINK)
      }

      throw error
    }

    return { ok: true }
  }
}
