import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CoverIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M5 19V8.5A1.5 1.5 0 016.5 7H12l1.5-2h4A1.5 1.5 0 0119 6.5V19" />
      <path {...STROKE} d="M5 19h14" />
    </IconFrame>
  )
}
