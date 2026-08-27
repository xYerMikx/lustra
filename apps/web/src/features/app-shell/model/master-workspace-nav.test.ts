import { describe, expect, it } from 'vitest'

import {
  MASTER_WORKSPACE_MORE,
  MASTER_WORKSPACE_PRIMARY,
  isMasterWorkspacePath,
  isWorkspaceItemActive,
  workspaceNavItems,
} from '@/features/app-shell/model/master-workspace-nav'

describe('master workspace nav', () => {
  it('treats cabinet, master routes and onboarding as workspace', () => {
    expect(isMasterWorkspacePath('/app')).toBe(true)
    expect(isMasterWorkspacePath('/app/master/calendar')).toBe(true)
    expect(isMasterWorkspacePath('/app/onboarding')).toBe(true)
    expect(isMasterWorkspacePath('/catalog')).toBe(false)
  })

  it('marks nested booking detail as the bookings item', () => {
    expect(
      isWorkspaceItemActive('/app/master/bookings/abc', '/app/master/bookings'),
    ).toBe(true)
    expect(isWorkspaceItemActive('/app', '/app')).toBe(true)
    expect(isWorkspaceItemActive('/app/master/calendar', '/app')).toBe(false)
  })

  it('keeps finances on the primary mobile bar', () => {
    expect(MASTER_WORKSPACE_PRIMARY.map((item) => item.href)).toEqual([
      '/app',
      '/app/master/calendar',
      '/app/master/bookings',
      '/app/master/ledger',
    ])
    expect(
      MASTER_WORKSPACE_PRIMARY.find((item) => item.href === '/app/master/ledger')
        ?.label,
    ).toBe('Финансы')
    expect(MASTER_WORKSPACE_MORE.map((item) => item.href)).toContain(
      '/app/master/portfolio',
    )
    expect(MASTER_WORKSPACE_MORE.map((item) => item.href)).toContain(
      '/app/master/profile',
    )
  })

  it('hides first-steps after onboarding is done', () => {
    expect(
      workspaceNavItems(
        [{ href: '/app/onboarding', label: 'Первые шаги', icon: 'onboarding' }],
        'done',
      ),
    ).toEqual([])
    expect(
      workspaceNavItems(
        [{ href: '/app/onboarding', label: 'Первые шаги', icon: 'onboarding' }],
        'services',
      ),
    ).toHaveLength(1)
  })
})
