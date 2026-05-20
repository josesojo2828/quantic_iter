import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Milestone, MilestoneCompletion, ActivityLog } from '../../domain/progress.entity';

@Injectable()
export class ProgressRepository extends BaseRepository<any> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // Milestones
  async createMilestone(data: Partial<Milestone>): Promise<Milestone> {
    return this.prisma.milestone.create({
      data: {
        tenantId: data.tenantId!,
        programId: data.programId!,
        title: data.title!,
        description: data.description,
        order: data.order || 0,
        xpReward: data.xpReward || 500,
      },
    }) as unknown as Milestone;
  }

  async findMilestonesByProgram(programId: string, scope: QueryScope): Promise<Milestone[]> {
    return this.prisma.milestone.findMany({
      where: this.applyScope({ programId }, scope, { menteeField: null, coachField: null }),
      orderBy: { order: 'asc' },
    }) as unknown as Milestone[];
  }

  async completeMilestone(milestoneId: string, menteeId: string, date?: Date): Promise<MilestoneCompletion> {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
    });
    if (!milestone) {
      throw new Error('Hito no encontrado');
    }

    const frequency = milestone.frequency || 'ONCE';
    let targetDate = new Date(new Date(date || new Date()).setHours(0, 0, 0, 0));

    if (frequency === 'ONCE') {
      const existing = await this.prisma.milestoneCompletion.findFirst({
        where: { milestoneId, menteeId },
      });
      if (existing) {
        throw new Error('Este hito de frecuencia ÚNICA ya ha sido completado.');
      }
    } else if (frequency === 'WEEKLY') {
      // Normalizar al lunes de la semana actual
      const startOfWeek = new Date(targetDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      targetDate = startOfWeek;

      const existing = await this.prisma.milestoneCompletion.findUnique({
        where: {
          milestoneId_menteeId_date: { milestoneId, menteeId, date: targetDate },
        },
      });
      if (existing) {
        throw new Error('Este hito semanal ya ha sido completado por esta semana.');
      }
    } else if (frequency === 'DAILY') {
      const existing = await this.prisma.milestoneCompletion.findUnique({
        where: {
          milestoneId_menteeId_date: { milestoneId, menteeId, date: targetDate },
        },
      });
      if (existing) {
        throw new Error('Este hito diario ya ha sido completado por hoy.');
      }
    }

    return this.prisma.milestoneCompletion.upsert({
      where: {
        milestoneId_menteeId_date: { milestoneId, menteeId, date: targetDate },
      },
      update: {},
      create: { milestoneId, menteeId, date: targetDate },
    }) as unknown as MilestoneCompletion;
  }

  async getMenteeCompletions(menteeId: string): Promise<MilestoneCompletion[]> {
    return this.prisma.milestoneCompletion.findMany({
      where: { menteeId },
    }) as unknown as MilestoneCompletion[];
  }

  // Activity Logs
  async createActivityLog(data: Partial<ActivityLog>): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        tenantId: data.tenantId!,
        menteeId: data.menteeId!,
        type: data.type!,
        title: data.title!,
        description: data.description,
        metadata: data.metadata || {},
      },
    }) as unknown as ActivityLog;
  }

  async getMenteeTimeline(menteeId: string, scope: QueryScope): Promise<ActivityLog[]> {
    return this.prisma.activityLog.findMany({
      where: this.applyScope({ menteeId }, scope, { coachField: null }),
      orderBy: { createdAt: 'desc' },
      take: 50,
    }) as unknown as ActivityLog[];
  }
}
