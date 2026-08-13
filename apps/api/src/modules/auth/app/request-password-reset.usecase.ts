import { Inject, Injectable, Logger } from '@nestjs/common'
import type { ForgotPasswordInput, OkResponse } from '@lustra/contracts'

import { publicAppUrl } from '@/common/env/public-app-url'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import { MAILER, type Mailer } from '@/modules/auth/app/mailer.port'
import {
  PASSWORD_RESET_TTL_SEC,
  buildPasswordResetUrl,
} from '@/modules/auth/domain/password-reset-email'
import {
  generateAuthToken,
  hashToken,
} from '@/modules/auth/domain/token-hash'
import { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name)

  constructor(
    private readonly users: AuthUserRepository,
    private readonly tokens: AuthTokenRepository,
    @Inject(MAILER) private readonly mailer: Mailer,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<OkResponse> {
    const user = await this.users.findByEmail(input.email)
    const now = this.clock.now()

    if (!user || user.status !== 'active' || user.deletedAt) {

      return { ok: true }
    }

    const rawToken = generateAuthToken()
    const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_SEC * 1000)

    await this.tx.run(async () => {
      await this.tokens.invalidateUnused(user.id, 'password_reset', now)
      await this.tokens.create({
        userId: user.id,
        kind: 'password_reset',
        tokenHash: hashToken(rawToken),
        expiresAt,
      })
    })

    try {
      await this.mailer.sendPasswordReset({
        to: user.email,
        firstName: user.firstName,
        resetUrl: buildPasswordResetUrl(publicAppUrl(), rawToken),
      })
    } catch (error) {
      this.logger.error(error, 'password reset email failed')
    }

    return { ok: true }
  }
}
