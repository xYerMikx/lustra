import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

type AppSectionLayoutProps = {
  children: ReactNode
}

export default function AppSectionLayout({ children }: AppSectionLayoutProps) {
  return children
}
