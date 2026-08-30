import { randomBytes } from 'node:crypto'

export const TELEGRAM_LINK_TTL_SEC = 10 * 60

export type TelegramStartCommand =
  | { kind: 'bare' }
  | { kind: 'nonce'; value: string }

export function generateTelegramLinkNonce(): string {
  return randomBytes(24).toString('base64url')
}

export function telegramDeepLink(botUsername: string, nonce: string): string {
  const username = botUsername.replace(/^@/, '').trim() || 'lumira_bot'

  return `https://t.me/${username}?start=${nonce}`
}

export function parseTelegramStartCommand(
  text: string | undefined,
): TelegramStartCommand | null {
  if (!text) {
    return null
  }

  const trimmed = text.trim()
  const match = /^\/start(?:@\w+)?(?:\s+(.+))?$/u.exec(trimmed)

  if (!match) {
    return null
  }

  const payload = match[1]?.trim() ?? ''

  if (!payload) {
    return { kind: 'bare' }
  }

  return { kind: 'nonce', value: payload }
}

export function parseTelegramStartNonce(text: string | undefined): string | null {
  const command = parseTelegramStartCommand(text)

  if (!command || command.kind === 'bare') {
    return null
  }

  return command.value
}

export function telegramOpenAppUrl(appOrigin: string): string {
  return `${appOrigin.replace(/\/$/, '')}/app`
}

export function isTelegramHttpsButtonUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') {
      return false
    }

    return parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1'
  } catch {
    return false
  }
}

export function telegramReturnAppUrl(
  appOrigin: string,
  role: 'client' | 'master' | 'admin',
): string {
  const origin = appOrigin.replace(/\/$/, '')

  if (role === 'master') {
    return `${origin}/app/?telegram=linked`
  }

  if (role === 'client') {
    return `${origin}/app/client/bookings?telegram=linked`
  }

  return `${origin}/app?telegram=linked`
}
