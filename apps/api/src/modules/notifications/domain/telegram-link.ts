import { randomBytes } from 'node:crypto'

export const TELEGRAM_LINK_TTL_SEC = 10 * 60

export function generateTelegramLinkNonce(): string {
  return randomBytes(24).toString('base64url')
}

export function telegramDeepLink(botUsername: string, nonce: string): string {
  const username = botUsername.replace(/^@/, '').trim() || 'lustra_bot'

  return `https://t.me/${username}?start=${nonce}`
}

export function parseTelegramStartNonce(text: string | undefined): string | null {
  if (!text) {
    return null
  }

  const trimmed = text.trim()

  if (!trimmed.startsWith('/start')) {
    return null
  }

  const nonce = trimmed.slice('/start'.length).trim()

  if (!nonce) {
    return null
  }

  return nonce
}
