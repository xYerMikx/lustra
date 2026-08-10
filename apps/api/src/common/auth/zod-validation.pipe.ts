import {
  type ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common'
import type { ZodTypeAny } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const parsed = this.schema.safeParse(value)
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Ошибка валидации',
        details: parsed.error.flatten(),
      })
    }
    return parsed.data
  }
}
