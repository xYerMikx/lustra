import { randomBytes } from 'node:crypto'

import { slugify } from '@/modules/auth/domain/slugify'

type SlugAvailability = (slug: string) => Promise<boolean>

const MAX_ATTEMPTS = 20

/**
 * Picks a URL slug for a display name, appending random suffixes on collision.
 */
export async function resolveUniqueSlug(
  displayName: string,
  isTaken: SlugAvailability,
): Promise<string> {
  const base = slugify(displayName) || 'master'
  let candidate = base

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const taken = await isTaken(candidate)

    if (!taken) {
      return candidate
    }

    candidate = `${base}-${randomBytes(2).toString('hex')}`
  }

  return `${base}-${randomBytes(3).toString('hex')}`
}
