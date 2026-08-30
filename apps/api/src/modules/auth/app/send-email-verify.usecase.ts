import { Inject, Injectable, Logger } from '@nestjs/common'
import type { OkResponse } from '@lumira/contracts'

import { publicAppUrl } from '@/common/env/public-app-url'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import { MAILER, type Mailer } from '@/modules/auth/app/mailer.port'
import {
  EMAIL_VERIFY_TTL_SEC,
  buildEmailVerifyUrl,
} from '@/modules/auth/domain/email-verify-email'
import {
  generateAuthToken,
  hashToken,
} from '@/modules/auth/domain/token-hash'
import { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'

@Injectable()
export class SendEmailVerifyUseCase {
  private readonly logger = new Logger(SendEmailVerifyUseCase.name)

  constructor(
    private readonly users: AuthUserRepository,
    private readonly tokens: AuthTokenRepository,
    @Inject(MAILER) private readonly mailer: Mailer,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(userId: string): Promise<OkResponse> {
    const user = await this.users.findById(userId)
    const now = this.clock.now()

    if (!user || user.emailVerified || user.status !== 'active' || user.deletedAt) {

      return { ok: true }
    }

    const rawToken = generateAuthToken()
    const expiresAt = new Date(now.getTime() + EMAIL_VERIFY_TTL_SEC * 1000)

    await this.tx.run(async () => {
      await this.tokens.invalidateUnused(user.id, 'email_verify', now)
      await this.tokens.create({
        userId: user.id,
        kind: 'email_verify',
        tokenHash: hashToken(rawToken),
        expiresAt,
      })
    })

    try {
      await this.mailer.sendEmailVerify({
        to: user.email,
        firstName: user.firstName,
        verifyUrl: buildEmailVerifyUrl(publicAppUrl(), rawToken),
      })
    } catch (error) {
      this.logger.error(error, 'email verify email failed')
    }

    return { ok: true }
  }
}
