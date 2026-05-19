import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Resource } from '../../domain/resource.entity';

@Injectable()
export class ResourceRepository extends BaseRepository<Resource> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Partial<Resource>): Promise<Resource> {
    return this.prisma.resource.create({
      data: {
        tenantId: data.tenantId!,
        coachId: data.coachId!,
        title: data.title!,
        description: data.description,
        type: data.type || 'ARTICLE',
        url: data.url,
        content: data.content,
        category: data.category || 'GENERAL',
        isPublic: data.isPublic || false,
        programId: data.programId,
        phaseId: data.phaseId,
      },
    }) as unknown as Resource;
  }

  async findAll(scope: QueryScope): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: this.applyScope({}, scope),
      orderBy: { createdAt: 'desc' },
    }) as unknown as Resource[];
  }

  async findAvailableForMentee(menteeId: string, programIds: string[], scope: QueryScope): Promise<Resource[]> {
    return this.prisma.resource.findMany({
      where: {
        tenantId: scope.tenantId,
        OR: [
          { isPublic: true },
          { programId: { in: programIds } }
        ]
      },
      orderBy: { category: 'asc' },
    }) as unknown as Resource[];
  }

  async findById(id: string, scope: QueryScope): Promise<Resource | null> {
    return this.prisma.resource.findFirst({
      where: this.applyScope({ id }, scope),
    }) as unknown as Resource;
  }

  async update(id: string, data: Partial<Resource>, scope: QueryScope): Promise<Resource> {
    return this.prisma.resource.update({
      where: { id },
      data,
    }) as unknown as Resource;
  }

  async delete(id: string, scope: QueryScope): Promise<void> {
    await this.prisma.resource.delete({
      where: { id },
    });
  }
}
