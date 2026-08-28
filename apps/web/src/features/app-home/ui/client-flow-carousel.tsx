import { ClientFlowSlideCard } from '@/features/app-home/ui/client-flow-slide-card'
import { CLIENT_FLOW_SLIDES } from '@/features/app-home/model/client-flow-slides'
import { PreviewCarousel } from '@/shared/ui/preview-carousel'

export function ClientFlowCarousel() {
  return (
    <PreviewCarousel label="Как записывается клиент" items={CLIENT_FLOW_SLIDES}>
      {CLIENT_FLOW_SLIDES.map((slide) => (
        <ClientFlowSlideCard key={slide.id} slide={slide} />
      ))}
    </PreviewCarousel>
  )
}
