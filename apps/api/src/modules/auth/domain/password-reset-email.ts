import { brandedEmailHtml } from '@/modules/auth/domain/branded-email-html'
import { escapeHtml } from '@/modules/auth/domain/escape-html'

export const PASSWORD_RESET_TTL_SEC = 60 * 60

export function buildPasswordResetUrl(appUrl: string, token: string): string {
  const base = appUrl.replace(/\/$/, '')

  return `${base}/app/reset?token=${encodeURIComponent(token)}`
}

export function passwordResetEmailCopy(input: {
  firstName: string
  resetUrl: string
}): { subject: string; text: string; html: string } {
  const name = input.firstName.trim() || 'вы'
  const subject = 'Сброс пароля Lumira'
  const text = `Здравствуйте, ${name}.\n\nСсылка для нового пароля (действует 1 час):\n${input.resetUrl}\n\nЕсли вы не запрашивали сброс, просто игнорируйте письмо.`
  const inner = `<p>Здравствуйте, ${escapeHtml(name)}.</p><p>Ссылка для нового пароля (действует 1 час):</p><p><a href="${escapeHtml(input.resetUrl)}">${escapeHtml(input.resetUrl)}</a></p><p>Если вы не запрашивали сброс, просто игнорируйте письмо.</p>`

  return { subject, text, html: brandedEmailHtml(inner) }
}
