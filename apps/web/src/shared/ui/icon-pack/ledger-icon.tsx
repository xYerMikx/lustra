import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function LedgerIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M6.5 5.5h11A1.5 1.5 0 0119 7v12.5A1.5 1.5 0 0117.5 21h-11A1.5 1.5 0 015 19.5V7A1.5 1.5 0 016.5 5.5z" />
      <path {...STROKE} d="M8.5 9.5h7M8.5 13h4.5M8.5 16.5h3" />
    </IconFrame>
  )
}
