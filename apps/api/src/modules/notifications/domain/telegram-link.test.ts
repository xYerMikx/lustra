import { describe, expect, it } from 'vitest'

import {
  isTelegramHttpsButtonUrl,
  parseTelegramStartCommand,
  parseTelegramStartNonce,
  telegramDeepLink,
  telegramOpenAppUrl,
  telegramReturnAppUrl,
} from '@/modules/notifications/domain/telegram-link'

describe('telegram start command', () => {
  it('treats /start without payload as a bare open', () => {
    expect(parseTelegramStartCommand('/start')).toEqual({ kind: 'bare' })
    expect(parseTelegramStartCommand('/start@lumira_bot')).toEqual({
      kind: 'bare',
    })
    expect(parseTelegramStartNonce('/start')).toBeNull()
  })

  it('reads a link nonce from /start payload', () => {
    expect(parseTelegramStartCommand('/start abc_nonce')).toEqual({
      kind: 'nonce',
      value: 'abc_nonce',
    })
    expect(parseTelegramStartNonce('/start abc_nonce')).toBe('abc_nonce')
  })

  it('builds app return urls', () => {
    expect(telegramDeepLink('@MyBot', 'n1')).toBe('https://t.me/MyBot?start=n1')
    expect(telegramOpenAppUrl('https://app.lumira.by/')).toBe(
      'https://app.lumira.by/app',
    )
    expect(telegramReturnAppUrl('https://app.lumira.by', 'master')).toBe(
      'https://app.lumira.by/app/?telegram=linked',
    )
    expect(telegramReturnAppUrl('https://app.lumira.by', 'client')).toBe(
      'https://app.lumira.by/app/client/bookings?telegram=linked',
    )
    expect(isTelegramHttpsButtonUrl('https://app.lumira.by/app')).toBe(true)
    expect(isTelegramHttpsButtonUrl('http://localhost:3000/app')).toBe(false)
    expect(isTelegramHttpsButtonUrl('https://localhost/app')).toBe(false)
  })
})
