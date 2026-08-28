export const navPathname = (pathname: string): string => {
  const trimmed = pathname.replace(/\/$/, '')

  if (trimmed === '') {
    return '/'
  }

  return trimmed
}

export const isNavCurrent = (pathname: string, href: string): boolean => {
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:')
  ) {
    return false
  }

  const path = navPathname(pathname)
  const hashAt = href.indexOf('#')
  const withoutHash = hashAt === -1 ? href : href.slice(0, hashAt)
  const target = navPathname(withoutHash || '/')

  if (href.includes('#') && target === '/') {
    return false
  }

  if (target === '/') {
    return path === '/'
  }

  return path === target || path.startsWith(`${target}/`)
}
