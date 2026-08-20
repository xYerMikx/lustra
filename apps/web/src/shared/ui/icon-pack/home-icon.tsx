import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function HomeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M4 11.5L12 4.5l8 7V19a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19z" />
      <path {...STROKE} d="M10 20.5V14h4v6.5" />
    </IconFrame>
  )
}
