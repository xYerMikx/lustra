import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function MoreIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="6" cy="12" r="1.4" {...STROKE} />
      <circle cx="12" cy="12" r="1.4" {...STROKE} />
      <circle cx="18" cy="12" r="1.4" {...STROKE} />
    </IconFrame>
  )
}
