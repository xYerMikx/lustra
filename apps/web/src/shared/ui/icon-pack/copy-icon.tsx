import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function CopyIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M9 8.5h9.5A1.5 1.5 0 0120 10v9.5A1.5 1.5 0 0118.5 21H9A1.5 1.5 0 017.5 19.5V10A1.5 1.5 0 019 8.5z" />
      <path {...STROKE} d="M6.5 15.5H5.5A1.5 1.5 0 014 14V4.5A1.5 1.5 0 015.5 3H15A1.5 1.5 0 0116.5 4.5V6" />
    </IconFrame>
  )
}
