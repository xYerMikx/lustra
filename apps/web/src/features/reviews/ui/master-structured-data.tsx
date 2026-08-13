import type { MasterStructuredData } from '@/features/reviews/model/build-master-structured-data'
import { serializeStructuredData } from '@/shared/lib/serialize-structured-data'

type MasterStructuredDataProps = {
  data: MasterStructuredData
}

export function MasterStructuredData({ data }: MasterStructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  )
}
