export function publicMediaUrl(storageKey: string): string {
  const base = (process.env.PUBLIC_API_URL ?? 'http://localhost:3333').replace(
    /\/$/,
    '',
  )

  return `${base}/media/${storageKey}`
}
