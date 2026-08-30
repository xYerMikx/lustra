import { Injectable } from '@nestjs/common'
import type { ServiceCategoryView } from '@lumira/contracts'

import { PrismaService } from '@/common/prisma/prisma.service'

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  listAll(): Promise<ServiceCategoryView[]> {
    return this.prisma.serviceCategory.findMany({
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        sort: true,
        parentId: true,
      },
    })
  }

  findById(id: string): Promise<{ id: string; slug: string } | null> {
    return this.prisma.serviceCategory.findUnique({
      where: { id },
      select: { id: true, slug: true },
    })
  }

  findBySlug(slug: string): Promise<ServiceCategoryView | null> {
    return this.prisma.serviceCategory.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        sort: true,
        parentId: true,
      },
    })
  }
}
