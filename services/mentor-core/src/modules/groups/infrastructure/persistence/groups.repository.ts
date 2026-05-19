import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Group } from '@prisma/client';

@Injectable()
export class GroupsRepository extends BaseRepository<Group> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private applyGroupScope(where: any, scope: QueryScope) {
    const baseWhere = {
      ...where,
      tenantId: scope.tenantId,
    };

    if (scope.role === 'mentee') {
      return {
        ...baseWhere,
        members: {
          some: {
            menteeId: scope.userId,
          },
        },
      };
    }

    if (scope.coachId && scope.role === 'mentor') {
      return { ...baseWhere, coachId: scope.coachId };
    }

    return baseWhere;
  }

  async findAll(scope: QueryScope): Promise<Group[]> {
    return this.prisma.group.findMany({
      where: this.applyGroupScope({}, scope),
      include: {
        _count: {
          select: { members: true }
        },
        members: {
          take: 3,
          orderBy: { joinedAt: 'desc' }
        }
      },
    });
  }

  async findOne(id: string, scope: QueryScope): Promise<Group | null> {
    return this.prisma.group.findFirst({
      where: this.applyGroupScope({ id }, scope),
      include: { members: true },
    });
  }

  async create(data: any, scope: QueryScope): Promise<Group> {
    return this.prisma.group.create({
      data: {
        ...data,
        coachId: scope.coachId || scope.userId,
        tenantId: scope.tenantId!,
      },
    });
  }

  async addMember(groupId: string, menteeId: string): Promise<any> {
    return this.prisma.groupMember.upsert({
      where: {
        groupId_menteeId: { groupId, menteeId },
      },
      update: {},
      create: { groupId, menteeId },
    });
  }

  async removeMember(groupId: string, menteeId: string): Promise<any> {
    return this.prisma.groupMember.delete({
      where: {
        groupId_menteeId: { groupId, menteeId },
      },
    });
  }

  async getMembers(groupId: string): Promise<any[]> {
    return this.prisma.groupMember.findMany({
      where: { groupId },
    });
  }

  async update(id: string, data: any, scope: QueryScope): Promise<Group> {
    return this.prisma.group.update({
      where: this.applyGroupScope({ id }, scope),
      data
    });
  }

  async delete(id: string, scope: QueryScope): Promise<void> {
    // Delete members first
    await this.prisma.groupMember.deleteMany({
      where: { groupId: id }
    });

    await this.prisma.group.delete({
      where: this.applyGroupScope({ id }, scope)
    });
  }

  async updateCoach(id: string, coachId: string, scope: QueryScope) {
    return this.prisma.group.update({
      where: this.applyGroupScope({ id }, scope),
      data: { coachId },
    });
  }
}

