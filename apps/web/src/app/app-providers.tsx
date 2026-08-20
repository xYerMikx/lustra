'use client'

import type { ReactNode } from 'react'

import { ToastProvider } from '@/shared/ui/toast'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>
}
