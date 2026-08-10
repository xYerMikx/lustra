import { Injectable } from '@nestjs/common'
import type { ServiceTemplateListResponse } from '@lustra/contracts'

import { listServiceTemplates } from '@/modules/master-services/domain/service-templates'

@Injectable()
export class ListServiceTemplatesUseCase {
  execute(categorySlug?: string): ServiceTemplateListResponse {
    return {
      templates: listServiceTemplates(categorySlug),
    }
  }
}
