import { Injectable } from '@nestjs/common'
import type { OkResponse, VerifyEmailInput } from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import { hashToken } from '@/modules/auth/domain/token-hash'
import { AuthTokenRepository, AUTH_TOKEN_ALREADY_USED } from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'

const INVALID_LINK = 'Ссылка недействительна или устарела'

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly tokens: AuthTokenRepository,
    private readonly users: AuthUserRepository,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(input: VerifyEmailInput): Promise<OkResponse> {
    const now = this.clock.now()
    const token = await this.tokens.findByHash('email_verify', hashToken(input.token))

    if (!token || !token.userId) {
      throw DomainError.invalidState(INVALID_LINK)
    }

    const userId = token.userId

    if (token.usedAt) {
      return this.okIfAlreadyVerified(userId)
    }

    if (token.expiresAt.getTime() <= now.getTime()) {
      throw DomainError.invalidState(INVALID_LINK)
    }

    try {
      await this.tx.run(async () => {
        await this.tokens.markUsed(token.id, now)
        await this.users.markEmailVerified(userId)
      })
    } catch (error) {
      if (error instanceof Error && error.message === AUTH_TOKEN_ALREADY_USED) {
        return this.okIfAlreadyVerified(userId)
      }

      throw error
    }

    return { ok: true }
  }

  private async okIfAlreadyVerified(userId: string): Promise<OkResponse> {
    const user = await this.users.findById(userId)

    if (user?.emailVerified) {

      return { ok: true }
    }

    throw DomainError.invalidState(INVALID_LINK)
  }
}
