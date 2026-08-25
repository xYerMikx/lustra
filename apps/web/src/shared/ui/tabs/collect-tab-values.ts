import { Children, isValidElement, type ReactNode } from 'react'

export function collectTabValues(children: ReactNode): string[] {
  const values: string[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string }>(child)) {
      return
    }

    if (typeof child.props.value === 'string') {
      values.push(child.props.value)
    }
  })

  return values
}
