import { z } from 'zod'

const INSTAGRAM_HANDLE = /^[A-Za-z0-9._]{1,30}$/
const TELEGRAM_HANDLE = /^[A-Za-z0-9_]{5,32}$/
const SOCIAL_URL =
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|t\.me|telegram\.me)\/([^/?#]+)/i

export function normalizeSocialHandle(raw: string): string {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return ''
  }

  const withoutAt = trimmed.replace(/^@+/, '')
  const urlMatch = withoutAt.match(SOCIAL_URL)

  if (urlMatch?.[1]) {
    return urlMatch[1].replace(/^@+/, '').replace(/\/+$/, '')
  }

  return withoutAt.replace(/\/+$/, '')
}

export function instagramProfileUrl(handle: string): string {
  return `https://instagram.com/${normalizeSocialHandle(handle)}`
}

export function telegramProfileUrl(handle: string): string {
  return `https://t.me/${normalizeSocialHandle(handle)}`
}

export const InstagramHandleSchema = z
  .string()
  .trim()
  .transform(normalizeSocialHandle)
  .refine((value) => INSTAGRAM_HANDLE.test(value), {
    message: 'Instagram: латиница, цифры, точка или подчёркивание',
  })

export const TelegramHandleSchema = z
  .string()
  .trim()
  .transform(normalizeSocialHandle)
  .refine((value) => TELEGRAM_HANDLE.test(value), {
    message: 'Telegram: 5–32 символа, латиница, цифры или _',
  })

export const WebsiteUrlSchema = z
  .string()
  .trim()
  .max(200, 'Максимум 200 символов')
  .url('Укажите ссылку вида https://…')
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'Ссылка должна начинаться с http:// или https://',
  })
