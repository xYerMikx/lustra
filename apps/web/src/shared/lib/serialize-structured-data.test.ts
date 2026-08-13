import { describe, expect, it } from 'vitest'

import { serializeStructuredData } from '@/shared/lib/serialize-structured-data'

describe('serializeStructuredData', () => {
  it('keeps a payload parseable after HTML-sensitive escapes', () => {
    const payload = {
      name: 'Анна',
      reviewBody: 'Аккуратно & быстро',
    }

    expect(JSON.parse(serializeStructuredData(payload))).toEqual(payload)
  })

  it('does not emit a raw script closer from review text', () => {
    const html = serializeStructuredData({
      reviewBody: '</script><script>alert(1)</script>',
    })

    expect(html.includes('</script>')).toBe(false)
    expect(html.includes('<script>')).toBe(false)
    expect(JSON.parse(html).reviewBody).toBe('</script><script>alert(1)</script>')
  })
})
