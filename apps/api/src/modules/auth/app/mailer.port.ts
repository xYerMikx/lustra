export type PasswordResetMail = {
  to: string
  firstName: string
  resetUrl: string
}

export type EmailVerifyMail = {
  to: string
  firstName: string
  verifyUrl: string
}

export type Mailer = {
  sendPasswordReset(mail: PasswordResetMail): Promise<void>
  sendEmailVerify(mail: EmailVerifyMail): Promise<void>
}

export const MAILER = Symbol('MAILER')
