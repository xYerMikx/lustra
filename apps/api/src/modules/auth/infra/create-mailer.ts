import { Logger } from '@nestjs/common'

import type { Mailer, PasswordResetMail } from '@/modules/auth/app/mailer.port'
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
    const copy = passwordResetEmailCopy(mail)
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [mail.to],
        subject: copy.subject,
        html: copy.html,
        text: copy.text,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      this.logger.error(`Resend ${response.status}: ${body}`)
      throw new Error('Failed to send password reset email')
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
