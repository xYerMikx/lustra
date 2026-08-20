import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M9 5.5L15.5 12 9 18.5" />
    </IconFrame>
  )
}
