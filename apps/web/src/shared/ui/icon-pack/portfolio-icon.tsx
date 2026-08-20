import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function PortfolioIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M4.5 7.5h15A1.5 1.5 0 0121 9v9.5A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5V9a1.5 1.5 0 011.5-1.5z" />
      <path {...STROKE} d="M8 7.5V6a1.5 1.5 0 011.5-1.5h5A1.5 1.5 0 0116 6v1.5M8.5 14.5l2.4-2.4 2.2 2.2 1.6-1.6 2.8 2.8" />
    </IconFrame>
  )
}
