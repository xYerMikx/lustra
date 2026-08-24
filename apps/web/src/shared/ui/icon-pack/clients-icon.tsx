import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ClientsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M16 21v-1.5A3.5 3.5 0 0012.5 16h-5A3.5 3.5 0 004 19.5V21" />
      <path {...STROKE} d="M10 10.5a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z" />
      <path {...STROKE} d="M20 21v-1.2a3 3 0 00-2.2-2.9" />
      <path {...STROKE} d="M16.2 7.2a2.6 2.6 0 010 5" />
    </IconFrame>
  )
}
