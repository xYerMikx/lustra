import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function EyeOffIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        {...STROKE}
        d="M3 4.5l17 15M9.6 9.8A3 3 0 0012 15.2M14.3 14.1A3 3 0 0012 8.8"
      />
      <path
        {...STROKE}
        d="M4.2 7.6C2.8 9.2 2 11 2 11s3.5 6.5 10 6.5c1.4 0 2.7-.3 3.8-.7M19.4 16.2C21 14.6 22 12.8 22 12.8s-3.5-6.5-10-6.5c-.9 0-1.8.1-2.6.3"
      />
    </IconFrame>
  )
}
