import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Objective } from '@prisma/client';

@Injectable()
export class ObjectiveRepository extends BaseRepository<Objective> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(scope: QueryScope): Promise<Objective[]> {
    return this.prisma.objective.findMany({
      where: this.applyScope({}, scope, { menteeField: 'menteeId' }),
      include: { programs: true },
    });
  }

  async findOne(id: string, scope: QueryScope): Promise<Objective | null> {
    return this.prisma.objective.findFirst({
      where: this.applyScope({ id }, scope, { menteeField: 'menteeId' }),
      include: { programs: true },
    });
  }

  async findByMentee(menteeId: string, scope: QueryScope): Promise<Objective[]> {
    return this.prisma.objective.findMany({
      where: this.applyScope({ menteeId }, scope, { menteeField: 'menteeId' }),
      include: { programs: true },
    });
  }

  async create(data: any, scope: QueryScope): Promise<Objective> {
    return this.prisma.objective.create({
      data: {
        title: data.title,
        description: data.description || null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: data.status || 'ACTIVE',
        menteeId: data.menteeId || scope.userId,
        tenantId: scope.tenantId!,
      },
    });
  }
}
