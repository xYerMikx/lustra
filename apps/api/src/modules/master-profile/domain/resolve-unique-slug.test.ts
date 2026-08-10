import { describe, expect, it, vi } from 'vitest'

import { resolveUniqueSlug } from './resolve-unique-slug'

describe('resolveUniqueSlug', () => {
  it('returns base slug when available', async () => {
    const isTaken = vi.fn().mockResolvedValue(false)
    await expect(resolveUniqueSlug('Анна', isTaken)).resolves.toBe('anna')
    expect(isTaken).toHaveBeenCalledWith('anna')
  })

  it('retries with suffix when base slug is taken', async () => {
    const isTaken = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    const slug = await resolveUniqueSlug('Anna Nails', isTaken)
    expect(slug.startsWith('anna-nails-')).toBe(true)
    expect(isTaken).toHaveBeenCalledTimes(2)
  })
})
