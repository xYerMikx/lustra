import { escapeHtml } from '@/modules/auth/domain/escape-html'

const FALLBACK_SITE_URL = 'https://lumira.by'

export function publicSiteUrl(): string {
  const raw = process.env.PUBLIC_SITE_URL?.trim()

  if (raw) {
    return raw.replace(/\/$/, '')
  }

  return FALLBACK_SITE_URL
}

export function brandedEmailHtml(innerHtml: string): string {
  const logoSrc = `${publicSiteUrl()}/email-mark.png`

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;color:#221a17;">
  <tr>
    <td style="padding:0 0 20px;">
      <img src="${escapeHtml(logoSrc)}" width="48" height="48" alt="Lumira" style="display:block;border-radius:24px;border:1px solid #e4d8cf;" />
    </td>
  </tr>
  <tr>
    <td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:28px;font-weight:700;padding:0 0 16px;">Lumira</td>
  </tr>
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;line-height:22px;">
      ${innerHtml}
    </td>
  </tr>
</table>`
}
