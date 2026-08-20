import { describe, expect, it } from 'vitest'

import {
  InstagramHandleSchema,
  TelegramHandleSchema,
  WebsiteUrlSchema,
  instagramProfileUrl,
  normalizeSocialHandle,
  telegramProfileUrl,
} from './social-handle'

describe('normalizeSocialHandle', () => {
  it('strips leading @', () => {
    expect(normalizeSocialHandle('@anna.nails')).toBe('anna.nails')
  })

  it('extracts the handle from Instagram and Telegram URLs', () => {
    expect(normalizeSocialHandle('https://instagram.com/anna.nails/')).toBe(
      'anna.nails',
    )
    expect(normalizeSocialHandle('https://t.me/anna_nails')).toBe('anna_nails')
  })
})

describe('profile urls', () => {
  it('builds clickable Instagram and Telegram links without @', () => {
    expect(instagramProfileUrl('@anna.nails')).toBe(
      'https://instagram.com/anna.nails',
    )
    expect(telegramProfileUrl('@anna_nails')).toBe('https://t.me/anna_nails')
  })
})

describe('handle schemas', () => {
  it('accepts normalized Instagram and Telegram handles', () => {
    expect(InstagramHandleSchema.parse('@anna.nails')).toBe('anna.nails')
    expect(TelegramHandleSchema.parse('https://t.me/anna_nails')).toBe(
      'anna_nails',
    )
  })

  it('rejects invalid handles and non-http websites', () => {
    expect(InstagramHandleSchema.safeParse('анна').success).toBe(false)
    expect(TelegramHandleSchema.safeParse('ab').success).toBe(false)
    expect(WebsiteUrlSchema.safeParse('example.com').success).toBe(false)
    expect(WebsiteUrlSchema.parse('https://example.com')).toBe(
      'https://example.com',
    )
  })
})
