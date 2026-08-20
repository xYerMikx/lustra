import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ShareIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="18" cy="5.5" r="2.4" {...STROKE} />
      <circle cx="6" cy="12" r="2.4" {...STROKE} />
      <circle cx="18" cy="18.5" r="2.4" {...STROKE} />
      <path {...STROKE} d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" />
    </IconFrame>
  )
}
