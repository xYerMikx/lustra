import { z } from 'zod'

const BY_MOBILE = /^\+375(25|29|33|44)\d{7}$/

export function normalizeByPhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '')

  if (digits.length === 9 && /^(25|29|33|44)/.test(digits)) {
    return `+375${digits}`
  }

  if (digits.length === 11 && digits.startsWith('80')) {
    return `+375${digits.slice(2)}`
  }

  if (digits.length === 12 && digits.startsWith('375')) {
    return `+${digits}`
  }

  return `+${digits}`
}

export const ByPhoneSchema = z
  .string()
  .trim()
  .min(1, 'Укажите телефон')
  .transform(normalizeByPhone)
  .refine((value) => BY_MOBILE.test(value), {
    message: 'Телефон в формате +375XXXXXXXXX',
  })
