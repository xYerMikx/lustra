import { IconFrame, type IconProps } from '@/shared/ui/icon-pack/icon-frame'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function OnboardingIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path {...STROKE} d="M8 6.5h10M8 12h10M8 17.5h6" />
      <path {...STROKE} d="M5 6.5h.01M5 12h.01M5 17.5h.01" />
    </IconFrame>
  )
}
