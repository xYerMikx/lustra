import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function QrIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2.5v2.5H14zM18.5 14H20v2.5h-1.5zM14 18.5h2.5V20H14zM18.5 18.5H20V20h-1.5z" />
    </IconFrame>
  )
}
