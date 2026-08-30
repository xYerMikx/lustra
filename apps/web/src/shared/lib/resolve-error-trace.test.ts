import { describe, expect, it } from 'vitest'

import { resolveErrorTrace } from '@/shared/lib/resolve-error-trace'

describe('resolveErrorTrace', () => {
  it('prefers the request id on the error', () => {
    expect(
      resolveErrorTrace(
        { requestId: 'req-api', digest: 'digest-1' },
        'req-stored',
      ),
    ).toBe('req-api')
  })

  it('falls back to the stored request id', () => {
    expect(resolveErrorTrace({ digest: 'digest-1' }, 'req-stored')).toBe(
      'req-stored',
    )
  })

  it('falls back to the Next.js digest', () => {
    expect(resolveErrorTrace({ digest: 'digest-1' })).toBe('digest-1')
  })

  it('returns nothing when no trace is available', () => {
    expect(resolveErrorTrace(new Error('boom'))).toBeUndefined()
  })
})
