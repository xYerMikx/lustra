export function assertStorageKey(storageKey: string): string {
  const normalized = storageKey.replace(/\\/g, '/')

  if (
    !normalized ||
    normalized.startsWith('/') ||
    normalized.includes('..') ||
    normalized.split('/').some((part) => part.length === 0)
  ) {
    throw new Error('Invalid media storage key')
  }

  return normalized
}
