import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Task } from '@prisma/client';

@Injectable()
export class TaskRepository extends BaseRepository<Task> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(scope: QueryScope): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: this.applyScope({}, scope, { menteeField: 'assigneeId' }),
    });
  }

  async findOne(id: string, scope: QueryScope): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: this.applyScope({ id }, scope, { menteeField: 'assigneeId' }),
    });
  }

  async findByMentee(menteeId: string, scope: QueryScope): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: this.applyScope({ assigneeId: menteeId }, scope, { menteeField: 'assigneeId' }),
    });
  }

  async create(data: any, scope: QueryScope): Promise<Task> {
    return this.prisma.task.create({
      data: {
        ...data,
        tenantId: scope.tenantId!,
        coachId: scope.coachId,
      },
    });
  }

  async update(id: string, data: any, scope: QueryScope): Promise<Task> {
    return this.prisma.task.update({
      where: this.applyScope({ id }, scope, { menteeField: 'assigneeId' }) as any, // Cast because of complex where clause with scope
      data,
    });
  }
}
