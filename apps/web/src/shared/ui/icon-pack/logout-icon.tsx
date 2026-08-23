import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M14 4.5h-6A1.5 1.5 0 0 0 6.5 6v12A1.5 1.5 0 0 0 8 19.5h6" />
      <path {...STROKE} d="M10.5 12H20M16.5 8.5L20 12l-3.5 3.5" />
    </IconFrame>
  )
}
