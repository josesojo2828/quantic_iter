import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Announcement } from '../../domain/announcement.entity';

@Injectable()
export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Partial<Announcement>): Promise<Announcement> {
    return this.prisma.announcement.create({
      data: {
        title: data.title!,
        content: data.content!,
        type: data.type || 'GENERAL',
        coachId: data.coachId!,
        tenantId: data.tenantId!,
        programId: data.programId,
        groupId: data.groupId,
      },
    }) as unknown as Announcement;
  }

  async findAll(scope: QueryScope, viewerId?: string): Promise<any[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: await this.applyAnnouncementScope({}, scope),
      include: viewerId ? {
        views: {
          where: { menteeId: viewerId }
        }
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return this.mapReadStatus(announcements, viewerId);
  }

  async findByProgram(programId: string, scope: QueryScope, viewerId?: string): Promise<any[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: await this.applyAnnouncementScope({ programId }, scope),
      include: viewerId ? {
        views: {
          where: { menteeId: viewerId }
        }
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return this.mapReadStatus(announcements, viewerId);
  }

  async findByGroup(groupId: string, scope: QueryScope, viewerId?: string): Promise<any[]> {
    const announcements = await this.prisma.announcement.findMany({
      where: await this.applyAnnouncementScope({ groupId }, scope),
      include: viewerId ? {
        views: {
          where: { menteeId: viewerId }
        }
      } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return this.mapReadStatus(announcements, viewerId);
  }

  private mapReadStatus(announcements: any[], viewerId?: string) {
    if (!viewerId) return announcements;
    return announcements.map(a => ({
      ...a,
      isRead: a.views.length > 0,
      views: undefined
    }));
  }

  async findById(id: string, scope: QueryScope): Promise<Announcement | null> {
    return this.prisma.announcement.findFirst({
      where: await this.applyAnnouncementScope({ id }, scope),
    }) as unknown as Announcement;
  }

  async markAsRead(announcementId: string, menteeId: string): Promise<void> {
    await this.prisma.announcementView.upsert({
      where: {
        announcementId_menteeId: {
          announcementId,
          menteeId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        announcementId,
        menteeId,
        viewedAt: new Date(),
      },
    });
  }

  async getStats(announcementId: string, scope: QueryScope): Promise<any> {
    const totalViews = await this.prisma.announcementView.count({
      where: { announcementId },
    });

    return { totalViews };
  }

  async delete(id: string, scope: QueryScope): Promise<void> {
    await this.prisma.announcement.deleteMany({
      where: await this.applyAnnouncementScope({ id }, scope),
    });
  }

  private async applyAnnouncementScope(where: any, scope: QueryScope) {
    const baseWhere = {
      ...where,
      tenantId: scope.tenantId,
    };

    if (scope.role === 'mentee') {
      // 1. Obtener los programas en los que el estudiante está inscrito
      const enrollments = await this.prisma.enrollment.findMany({
        where: { menteeId: scope.userId, tenantId: scope.tenantId },
      });
      const programIds = enrollments.map(e => e.programId);

      // 2. Obtener los grupos en los que el estudiante es miembro
      const groupMemberships = await this.prisma.groupMember.findMany({
        where: { menteeId: scope.userId },
      });
      const groupIds = groupMemberships.map(gm => gm.groupId);

      // Si se especificó un programa en la consulta original, validar que pertenezca a sus programas inscritos
      if (where.programId) {
        return {
          ...baseWhere,
          programId: programIds.includes(where.programId) ? where.programId : 'NONE',
        };
      }

      // Si se especificó un grupo en la consulta original, validar que pertenezca a sus grupos miembros
      if (where.groupId) {
        return {
          ...baseWhere,
          groupId: groupIds.includes(where.groupId) ? where.groupId : 'NONE',
        };
      }

      // De lo contrario, retornar anuncios GENERAL o que correspondan a sus programas/grupos inscritos
      return {
        ...baseWhere,
        OR: [
          { type: 'GENERAL' },
          { programId: { in: programIds } },
          { groupId: { in: groupIds } },
        ],
      };
    }

    if (scope.coachId && scope.role === 'mentor') {
      return { ...baseWhere, coachId: scope.coachId };
    }

    return baseWhere;
  }
}
