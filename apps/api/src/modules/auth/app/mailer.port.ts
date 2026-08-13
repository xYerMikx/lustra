export type PasswordResetMail = {
  to: string
  firstName: string
  resetUrl: string
}

export type Mailer = {
  sendPasswordReset(mail: PasswordResetMail): Promise<void>
}

export const MAILER = Symbol('MAILER')
