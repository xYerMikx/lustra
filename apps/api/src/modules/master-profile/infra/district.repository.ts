import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/common/prisma/prisma.service'

@Injectable()
export class DistrictRepository {
  constructor(private readonly prisma: PrismaService) {}

  listAll() {
    return this.prisma.district.findMany({
      orderBy: [{ sort: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
      },
    })
  }

  findById(id: string): Promise<{ id: string } | null> {
    return this.prisma.district.findUnique({
      where: { id },
      select: { id: true },
    })
  }
}
