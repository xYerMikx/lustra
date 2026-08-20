import { brandedEmailHtml } from '@/modules/auth/domain/branded-email-html'
import { escapeHtml } from '@/modules/auth/domain/escape-html'

export const EMAIL_VERIFY_TTL_SEC = 24 * 60 * 60

export function buildEmailVerifyUrl(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, '')

  return `${base}/app/verify?token=${encodeURIComponent(token)}`
}

export function emailVerifyEmailCopy(input: {
  firstName: string
  verifyUrl: string
}): { subject: string; text: string; html: string } {
  const name = input.firstName.trim() || 'вы'
  const subject = 'Подтверждение почты Lumira'
  const text = `Здравствуйте, ${name}.\n\nПодтвердите почту по ссылке (действует 24 часа):\n${input.verifyUrl}\n\nЕсли вы не регистрировались в Lumira, просто игнорируйте письмо.`
  const inner = `<p>Здравствуйте, ${escapeHtml(name)}.</p><p>Подтвердите почту по ссылке (действует 24 часа):</p><p><a href="${escapeHtml(input.verifyUrl)}">${escapeHtml(input.verifyUrl)}</a></p><p>Если вы не регистрировались в Lumira, просто игнорируйте письмо.</p>`

  return { subject, text, html: brandedEmailHtml(inner) }
}
