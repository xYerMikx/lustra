import type { ReactNode } from 'react'

import type { MasterWorkspaceItem } from '@/features/app-shell/model/master-workspace-nav'
import {
  BookingsIcon,
  CalendarIcon,
  HomeIcon,
  OnboardingIcon,
  PortfolioIcon,
  ReviewsIcon,
} from '@/shared/ui/icon-pack'

const ICONS: Record<MasterWorkspaceItem['icon'], ReactNode> = {
  home: <HomeIcon />,
  calendar: <CalendarIcon />,
  bookings: <BookingsIcon />,
  portfolio: <PortfolioIcon />,
  reviews: <ReviewsIcon />,
  onboarding: <OnboardingIcon />,
}

export function MasterWorkspaceIcon({
  name,
}: {
  name: MasterWorkspaceItem['icon']
}) {
  return ICONS[name]
}
