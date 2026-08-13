import { Logger } from '@nestjs/common'

import type { EmailVerifyMail, Mailer, PasswordResetMail } from '@/modules/auth/app/mailer.port'
import { emailVerifyEmailCopy } from '@/modules/auth/domain/email-verify-email'
import { passwordResetEmailCopy } from '@/modules/auth/domain/password-reset-email'
import { ConsoleMailer } from '@/modules/auth/infra/console-mailer'

const RESEND_API_URL = 'https://api.resend.com/emails'

export class ResendMailer implements Mailer {
  private readonly logger = new Logger(ResendMailer.name)

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async sendPasswordReset(mail: PasswordResetMail): Promise<void> {
    await this.send(mail.to, passwordResetEmailCopy(mail), 'Failed to send password reset email')
  }

  async sendEmailVerify(mail: EmailVerifyMail): Promise<void> {
    await this.send(mail.to, emailVerifyEmailCopy(mail), 'Failed to send email verification')
  }

  private async send(
    to: string,
    copy: { subject: string; html: string; text: string },
    failMessage: string,
  ): Promise<void> {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [to],
        subject: copy.subject,
        html: copy.html,
        text: copy.text,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      this.logger.error(`Resend ${response.status}: ${body}`)
      throw new Error(failMessage)
    }
  }
}

export function createMailerFromEnv(): Mailer {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from =
    process.env.RESEND_FROM?.trim() || 'Lustra <noreply@lustra.by>'

  if (apiKey) {
    return new ResendMailer(apiKey, from)
  }

  return new ConsoleMailer()
}
