import { Logger } from '@nestjs/common'

import { isProduction } from '@/common/env/is-production'
import type { Mailer, PasswordResetMail } from '@/modules/auth/app/mailer.port'
import { passwordResetEmailCopy } from '@/modules/auth/domain/password-reset-email'

export class ConsoleMailer implements Mailer {
  private readonly logger = new Logger(ConsoleMailer.name)

  async sendPasswordReset(mail: PasswordResetMail): Promise<void> {
    const copy = passwordResetEmailCopy(mail)

    if (isProduction) {
      this.logger.error('RESEND_API_KEY is empty; password reset email was not sent')

      return
    }

    this.logger.log(`${copy.subject} → ${mail.to} ${mail.resetUrl}`)
  }
}
