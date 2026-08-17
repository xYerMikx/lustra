import { Logger } from '@nestjs/common'

import { isProduction } from '@/common/env/is-production'
import type { EmailVerifyMail, Mailer, PasswordResetMail } from '@/modules/auth/app/mailer.port'
import { emailVerifyEmailCopy } from '@/modules/auth/domain/email-verify-email'
import { passwordResetEmailCopy } from '@/modules/auth/domain/password-reset-email'

export class ConsoleMailer implements Mailer {
  private readonly logger = new Logger(ConsoleMailer.name)

  async sendPasswordReset(mail: PasswordResetMail): Promise<void> {
    this.logOrWarn(passwordResetEmailCopy(mail), mail.to, mail.resetUrl, 'password reset')
  }

  async sendEmailVerify(mail: EmailVerifyMail): Promise<void> {
    this.logOrWarn(emailVerifyEmailCopy(mail), mail.to, mail.verifyUrl, 'email verify')
  }

  private logOrWarn(
    copy: { subject: string },
    to: string,
    url: string,
    kind: string,
  ): void {
    if (isProduction) {
      this.logger.error(`RESEND_API_KEY is empty; ${kind} email was not sent`)

      return
    }

    this.logger.log(`${copy.subject} → ${to} ${url}`)
  }
}
