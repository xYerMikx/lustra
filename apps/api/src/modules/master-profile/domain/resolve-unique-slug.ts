import { randomBytes } from 'node:crypto'

import { slugify } from '../../auth/domain/slugify'

type SlugAvailability = (slug: string) => Promise<boolean>

/**
 * Picks a URL slug for a display name, appending random suffixes on collision.
 */
export async function resolveUniqueSlug(
  displayName: string,
  isTaken: SlugAvailability,
): Promise<string> {
  const base = slugify(displayName) || 'master'
  let candidate = base

  for (let attempt = 0; attempt < 20; attempt++) {
    if (!(await isTaken(candidate))) {
      return candidate
    }
    candidate = `${base}-${randomBytes(2).toString('hex')}`
  }

  return `${base}-${randomBytes(3).toString('hex')}`
}
