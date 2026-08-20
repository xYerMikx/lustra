import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function EyeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        {...STROKE}
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
      />
      <circle cx="12" cy="12" r="2.6" {...STROKE} />
    </IconFrame>
  )
}
