import { describe, expect, it } from 'vitest'

import { buildMasterSlug, slugify } from './slugify'

describe('slugify', () => {
  it('transliterates cyrillic names', () => {
    expect(slugify('Анна')).toBe('anna')
  })

  it('collapses separators and trims edges', () => {
    expect(slugify('  Anna   Nails!! ')).toBe('anna-nails')
  })
})

describe('buildMasterSlug', () => {
  it('appends uniqueness suffix', () => {
    expect(buildMasterSlug('Анна', 'a1b2')).toBe('anna-a1b2')
  })

  it('falls back when name has no slug chars', () => {
    expect(buildMasterSlug('!!!', 'x9')).toBe('master-x9')
  })
})
