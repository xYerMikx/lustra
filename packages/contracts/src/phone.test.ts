import { describe, expect, it } from 'vitest'

import {
  ByPhoneSchema,
  OptionalByPhoneSchema,
  normalizeByPhone,
} from './phone'

describe('normalizeByPhone', () => {
  it('keeps E.164 Belarus mobiles', () => {
    expect(normalizeByPhone('+375291112233')).toBe('+375291112233')
  })

  it('accepts 80XXXXXXXXX and 375XXXXXXXXX', () => {
    expect(normalizeByPhone('80291112233')).toBe('+375291112233')
    expect(normalizeByPhone('375291112233')).toBe('+375291112233')
  })

  it('accepts local 9-digit mobiles', () => {
    expect(normalizeByPhone('29 111-22-33')).toBe('+375291112233')
  })
})

describe('ByPhoneSchema', () => {
  it('parses formatted Belarus mobiles', () => {
    expect(ByPhoneSchema.parse('+375 (29) 111-22-33')).toBe('+375291112233')
    expect(ByPhoneSchema.parse('80251112233')).toBe('+375251112233')
  })

  it('rejects landlines and foreign numbers', () => {
    expect(ByPhoneSchema.safeParse('+375171112233').success).toBe(false)
    expect(ByPhoneSchema.safeParse('+79001234567').success).toBe(false)
    expect(ByPhoneSchema.safeParse('').success).toBe(false)
  })
})

describe('OptionalByPhoneSchema', () => {
  it('treats empty input as omitted', () => {
    expect(OptionalByPhoneSchema.parse('')).toBeUndefined()
    expect(OptionalByPhoneSchema.parse(undefined)).toBeUndefined()
  })

  it('still normalizes a filled number', () => {
    expect(OptionalByPhoneSchema.parse('80291112233')).toBe('+375291112233')
  })
})
