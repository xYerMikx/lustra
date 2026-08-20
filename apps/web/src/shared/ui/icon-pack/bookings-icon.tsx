import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function BookingsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M7 5.5h11.5A1.5 1.5 0 0120 7v12.5A1.5 1.5 0 0118.5 21H8A1.5 1.5 0 016.5 19.5V7" />
      <path {...STROKE} d="M6.5 7A2.5 2.5 0 004 9.5V18a3 3 0 003 3h11.5M10 10h6M10 14h6" />
    </IconFrame>
  )
}
