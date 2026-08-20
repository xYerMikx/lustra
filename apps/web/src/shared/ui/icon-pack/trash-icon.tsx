import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function TrashIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M5 7h14M10 7V5h4v2M8 7l.8 12h6.4L16 7" />
    </IconFrame>
  )
}
