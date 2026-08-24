import type { OnboardingStep } from '@lustra/contracts'

export type MasterWorkspaceItem = {
  href: string
  label: string
  icon: 'home' | 'calendar' | 'bookings' | 'clients' | 'portfolio' | 'reviews' | 'ledger' | 'onboarding'
}

export const MASTER_WORKSPACE_PRIMARY: MasterWorkspaceItem[] = [
  { href: '/app', label: 'Кабинет', icon: 'home' },
  { href: '/app/master/calendar', label: 'Календарь', icon: 'calendar' },
  { href: '/app/master/bookings', label: 'Записи', icon: 'bookings' },
  { href: '/app/master/portfolio', label: 'Портфолио', icon: 'portfolio' },
]

export const MASTER_WORKSPACE_MORE: MasterWorkspaceItem[] = [
  { href: '/app/master/clients', label: 'Клиенты', icon: 'clients' },
  { href: '/app/master/ledger', label: 'Касса', icon: 'ledger' },
  { href: '/app/master/reviews', label: 'Отзывы', icon: 'reviews' },
  { href: '/app/onboarding', label: 'Первые шаги', icon: 'onboarding' },
]

export const MASTER_WORKSPACE_ALL: MasterWorkspaceItem[] = [
  ...MASTER_WORKSPACE_PRIMARY,
  ...MASTER_WORKSPACE_MORE,
]

export function workspaceNavItems(
  items: MasterWorkspaceItem[],
  onboardingStep: OnboardingStep | null,
): MasterWorkspaceItem[] {
  if (onboardingStep === 'done') {
    return items.filter((item) => item.href !== '/app/onboarding')
  }

  return items
}

export function isMasterWorkspacePath(pathname: string): boolean {
  if (pathname === '/app' || pathname === '/app/onboarding') {
    return true
  }

  return pathname.startsWith('/app/master')
}

export function isWorkspaceItemActive(
  pathname: string,
  href: string,
): boolean {
  if (href === '/app') {
    return pathname === '/app'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
