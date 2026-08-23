import type { MeResponse, UserRole } from '@lustra/contracts'

export type AppNavItem = {
  href: string
  label: string
}

function bookingsHref(role: UserRole): string | null {
  if (role === 'master') {
    return '/app/master/bookings'
  }

  if (role === 'client') {
    return '/app/client/bookings'
  }

  return null
}

/** Consistent primary nav for all product pages. */
export function buildAppNavItems(user: MeResponse | null): AppNavItem[] {
  const items: AppNavItem[] = [{ href: '/catalog', label: 'Каталог' }]

  if (user) {
    const bookings = bookingsHref(user.role)

    if (bookings) {
      items.push({ href: bookings, label: 'Записи' })
    }

    if (user.role === 'client') {
      items.push({ href: '/app/client/favorites', label: 'Избранное' })
      items.push({ href: '/app/client/reviews', label: 'Отзывы' })
    }

    if (user.role === 'master') {
      items.push({ href: '/app/master/calendar', label: 'Календарь' })
    }

    if (user.role === 'admin') {
      items.push({ href: '/admin', label: 'Админка' })
    }
  }

  items.push({ href: '/app', label: 'Кабинет' })

  return items
}

export function initialsFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() ?? ''

  if (!local) {
    return '?'
  }

  return local.slice(0, 1).toUpperCase()
}

export function initialsFromUser(user: Pick<MeResponse, 'email' | 'firstName'>): string {
  const name = user.firstName.trim()

  if (name) {
    return name.slice(0, 1).toUpperCase()
  }

  return initialsFromEmail(user.email)
}
