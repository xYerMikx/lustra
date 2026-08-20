import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ReviewsIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        {...STROKE}
        d="M12 4.5l1.8 4.4 4.7.4-3.6 3.1 1.1 4.6L12 14.8 7.99 17l1.1-4.6-3.6-3.1 4.7-.4z"
      />
    </IconFrame>
  )
}
