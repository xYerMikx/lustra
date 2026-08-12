export function hrefForCategory(
  slug: string | undefined,
  district?: string,
): string {
  const base = slug ? `/catalog/${slug}` : '/catalog'
  const params = new URLSearchParams()

  if (district) {
    params.set('district', district)
  }

  const query = params.toString()

  return query ? `${base}?${query}` : base
}
