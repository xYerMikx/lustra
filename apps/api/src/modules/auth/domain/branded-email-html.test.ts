import { describe, expect, it } from 'vitest'

import { brandedEmailHtml } from '@/modules/auth/domain/branded-email-html'

describe('brandedEmailHtml', () => {
  it('wraps inner markup with the hosted Lumira mark', () => {
    const html = brandedEmailHtml('<p>Hi</p>')

    expect(html).toContain('https://lumira.by/email-mark.png')
    expect(html).toContain('alt="Lumira"')
    expect(html).toContain('<p>Hi</p>')
  })
})
