import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M5.5 9L12 15.5 18.5 9" />
    </IconFrame>
  )
}
