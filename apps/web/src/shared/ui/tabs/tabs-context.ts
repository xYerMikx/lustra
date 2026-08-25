import { createContext, useContext } from 'react'

export type TabsContextValue = {
  value: string
  onChange: (value: string) => void
}

export const TabsContext = createContext<TabsContextValue | null>(null)

export function useTabs(): TabsContextValue {
  const tabs = useContext(TabsContext)

  if (!tabs) {
    throw new Error('Tab must be used inside Tabs')
  }

  return tabs
}
