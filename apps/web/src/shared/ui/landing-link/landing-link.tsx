import type { ComponentProps, ReactNode } from 'react'

import { landingUrl } from '@/shared/lib/landing-url'

type LandingLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href?: string
  children: ReactNode
}

export function LandingLink({
  href = '/',
  children,
  ...props
}: LandingLinkProps) {
  return (
    <a href={landingUrl(href)} {...props}>
      {children}
    </a>
  )
}
