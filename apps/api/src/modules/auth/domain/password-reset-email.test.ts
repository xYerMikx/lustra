import { describe, expect, it } from 'vitest'

import {
  buildPasswordResetUrl,
  passwordResetEmailCopy,
} from '@/modules/auth/domain/password-reset-email'

describe('buildPasswordResetUrl', () => {
  it('puts the token in a query on the app reset page', () => {
    expect(buildPasswordResetUrl('http://localhost:3000/', 'abc+1')).toBe(
      'http://localhost:3000/app/reset?token=abc%2B1',
    )
  })
})

describe('passwordResetEmailCopy', () => {
  it('escapes HTML in the name and url', () => {
    const copy = passwordResetEmailCopy({
      firstName: '<script>',
      resetUrl: 'http://localhost:3000/app/reset?token=a',
    })

    expect(copy.html.includes('<script>')).toBe(false)
    expect(copy.html.includes('&lt;script&gt;')).toBe(true)
    expect(copy.text).toContain('http://localhost:3000/app/reset?token=a')
  })
})
