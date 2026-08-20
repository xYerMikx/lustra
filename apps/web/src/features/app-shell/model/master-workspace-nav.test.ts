import { describe, expect, it } from 'vitest'

import {
  isMasterWorkspacePath,
  isWorkspaceItemActive,
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
})
