import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ProfileIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle {...STROKE} cx="12" cy="9" r="3.5" />
      <path {...STROKE} d="M6 19.5c1.4-3.1 3.4-4.7 6-4.7s4.6 1.6 6 4.7" />
    </IconFrame>
  )
}
