import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M15 5.5L8.5 12 15 18.5" />
    </IconFrame>
  )
}
