import { describe, expect, it } from 'vitest'
import type { MeResponse } from '@lumira/contracts'

import {
  buildAppNavItems,
  initialsFromEmail,
  isAppNavActive,
} from '@/features/app-shell/model/build-app-nav'

function user(partial: Partial<MeResponse> & Pick<MeResponse, 'role' | 'email'>): MeResponse {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    firstName: 'Test',
    lastName: null,
    emailVerified: true,
    telegramLinked: false,
    profileStatus: partial.role === 'master' ? 'published' : null,
    onboardingStep: partial.role === 'master' ? 'done' : null,
    ...partial,
  }
}

describe('buildAppNavItems', () => {
  it('shows catalog + cabinet for guests', () => {
    expect(buildAppNavItems(null)).toEqual([
      { href: '/catalog', label: 'Каталог' },
      { href: '/app', label: 'Кабинет' },
    ])
  })

  it('adds Записи for master and client', () => {
    expect(buildAppNavItems(user({ role: 'master', email: 'master@example.com' }))).toEqual([
      { href: '/catalog', label: 'Каталог' },
      { href: '/app/master/bookings', label: 'Записи' },
      { href: '/app/master/calendar', label: 'Календарь' },
      { href: '/app', label: 'Кабинет' },
    ])

    expect(buildAppNavItems(user({ role: 'client', email: 'client@example.com' }))).toEqual([
      { href: '/catalog', label: 'Каталог' },
      { href: '/app/client/bookings', label: 'Записи' },
      { href: '/app/client/favorites', label: 'Избранное' },
      { href: '/app/client/reviews', label: 'Отзывы' },
      { href: '/app', label: 'Кабинет' },
    ])
  })

  it('adds Админка only for admin', () => {
    expect(buildAppNavItems(user({ role: 'admin', email: 'admin@example.com' }))).toEqual([
      { href: '/catalog', label: 'Каталог' },
      { href: '/admin', label: 'Админка' },
      { href: '/app', label: 'Кабинет' },
    ])
  })
})

describe('isAppNavActive', () => {
  it('marks home only on the app root', () => {
    expect(isAppNavActive('/', '/')).toBe(true)
    expect(isAppNavActive('/catalog', '/')).toBe(false)
    expect(isAppNavActive('/app', '/')).toBe(false)
  })

  it('marks catalog for category paths', () => {
    expect(isAppNavActive('/catalog', '/catalog')).toBe(true)
    expect(isAppNavActive('/catalog/manikyur', '/catalog')).toBe(true)
    expect(isAppNavActive('/app', '/catalog')).toBe(false)
  })

  it('marks cabinet only on the hub', () => {
    expect(isAppNavActive('/app', '/app')).toBe(true)
    expect(isAppNavActive('/app/login', '/app')).toBe(false)
  })

  it('marks login only on the login path', () => {
    expect(isAppNavActive('/app/login', '/app/login')).toBe(true)
    expect(isAppNavActive('/app', '/app/login')).toBe(false)
  })
})

describe('initialsFromEmail', () => {
  it('takes the first letter of the local part', () => {
    expect(initialsFromEmail('anna@example.com')).toBe('A')
  })
})
