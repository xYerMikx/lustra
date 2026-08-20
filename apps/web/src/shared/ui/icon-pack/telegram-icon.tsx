import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function TelegramIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        {...STROKE}
        d="M4 11.8L20 5.2l-3.4 14.2-4.8-5.4-4.6 2.2.9-5.8 10.4-6.6"
      />
    </IconFrame>
  )
}
