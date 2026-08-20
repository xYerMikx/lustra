import { describe, expect, it } from 'vitest'

import {
  clientNoteFromHandle,
  socialHandleFromNote,
} from '@/modules/bookings/domain/social-handle-note'

describe('social handle note', () => {
  it('reads a leading @handle from a client note', () => {
    expect(socialHandleFromNote('@anna.nails')).toBe('anna.nails')
    expect(socialHandleFromNote('@anna.nails хочет короткую длину')).toBe(
      'anna.nails',
    )
    expect(socialHandleFromNote('просто заметка')).toBeNull()
  })

  it('stores a handle as an @note', () => {
    expect(clientNoteFromHandle('anna.nails')).toBe('@anna.nails')
    expect(clientNoteFromHandle('@anna.nails')).toBe('@anna.nails')
    expect(clientNoteFromHandle('')).toBeNull()
  })
})
