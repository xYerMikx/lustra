import { describe, expect, it } from 'vitest'

import {
  buildEmailVerifyUrl,
  emailVerifyEmailCopy,
} from '@/modules/auth/domain/email-verify-email'

describe('buildEmailVerifyUrl', () => {
  it('puts the token in a query on the app verify page', () => {
    expect(buildEmailVerifyUrl('http://localhost:3000/', 'abc+1')).toBe(
      'http://localhost:3000/app/verify?token=abc%2B1',
    )
  })
})

describe('emailVerifyEmailCopy', () => {
  it('escapes HTML in the name and url', () => {
    const copy = emailVerifyEmailCopy({
      firstName: '<script>',
      verifyUrl: 'http://localhost:3000/app/verify?token=a',
    })

    expect(copy.html.includes('<script>')).toBe(false)
    expect(copy.html.includes('&lt;script&gt;')).toBe(true)
    expect(copy.text).toContain('http://localhost:3000/app/verify?token=a')
  })
})
