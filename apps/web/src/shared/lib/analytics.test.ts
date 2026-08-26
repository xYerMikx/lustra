import { describe, expect, it } from 'vitest'

import {
  getWebAnalyticsConfig,
  parseAnalyticsConsent,
  parseGaMeasurementId,
  parseMetrikaCounterId,
  parseSiteVerificationToken,
  parseWebvisorFlag,
} from '@/shared/lib/analytics'

describe('parseAnalyticsConsent', () => {
  it('accepts granted and denied', () => {
    expect(parseAnalyticsConsent('granted')).toBe('granted')
    expect(parseAnalyticsConsent('denied')).toBe('denied')
  })

  it('rejects empty and unknown values', () => {
    expect(parseAnalyticsConsent(null)).toBeNull()
    expect(parseAnalyticsConsent('')).toBeNull()
    expect(parseAnalyticsConsent('yes')).toBeNull()
  })
})

describe('parseMetrikaCounterId', () => {
  it('accepts a numeric counter id', () => {
    expect(parseMetrikaCounterId('12345678')).toBe('12345678')
  })

  it('rejects empty and non-numeric values', () => {
    expect(parseMetrikaCounterId(undefined)).toBeNull()
    expect(parseMetrikaCounterId('  ')).toBeNull()
    expect(parseMetrikaCounterId('G-XXXX')).toBeNull()
    expect(parseMetrikaCounterId('12')).toBeNull()
  })
})

describe('parseGaMeasurementId', () => {
  it('accepts a GA4 measurement id', () => {
    expect(parseGaMeasurementId('G-ABC12DEF34')).toBe('G-ABC12DEF34')
  })

  it('rejects UA and lowercase ids', () => {
    expect(parseGaMeasurementId('UA-123-1')).toBeNull()
    expect(parseGaMeasurementId('g-abc')).toBeNull()
  })
})

describe('parseSiteVerificationToken', () => {
  it('accepts a typical meta token', () => {
    expect(parseSiteVerificationToken('abcDEF123_-zz')).toBe('abcDEF123_-zz')
  })

  it('rejects html and short junk', () => {
    expect(parseSiteVerificationToken('<script>')).toBeNull()
    expect(parseSiteVerificationToken('short')).toBeNull()
  })
})

describe('parseWebvisorFlag', () => {
  it('is off by default', () => {
    expect(parseWebvisorFlag(undefined)).toBe(false)
    expect(parseWebvisorFlag('0')).toBe(false)
  })

  it('accepts explicit true values', () => {
    expect(parseWebvisorFlag('1')).toBe(true)
    expect(parseWebvisorFlag('true')).toBe(true)
  })
})

describe('getWebAnalyticsConfig', () => {
  it('stays disabled without public ids', () => {
    const previousMetrika = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    const previousGa = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    expect(getWebAnalyticsConfig().enabled).toBe(false)

    if (previousMetrika) {
      process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = previousMetrika
    }

    if (previousGa) {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousGa
    }
  })
})
