import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function InstagramIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="4" y="4" width="16" height="16" rx="5" {...STROKE} />
      <circle cx="12" cy="12" r="3.2" {...STROKE} />
      <circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none" />
    </IconFrame>
  )
}
