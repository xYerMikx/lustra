import { describe, expect, it } from 'vitest'
import type { MasterClientView } from '@lustra/contracts'

import { clientSuggestMeta } from '@/features/manual-booking/model/client-suggest-meta'

const client: MasterClientView = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Оля',
  phone: '+375291112233',
  source: 'instagram',
  socialHandle: 'olya.nails',
  visitsCount: 0,
  lastVisitAt: null,
}

describe('clientSuggestMeta', () => {
  it('joins phone and handle', () => {
    expect(clientSuggestMeta(client)).toBe('+375291112233 · @olya.nails')
  })

  it('omits missing parts', () => {
    expect(
      clientSuggestMeta({ ...client, phone: null, socialHandle: null }),
    ).toBe('')
  })
})
