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
    const normalizedDate = new Date(new Date(date || new Date()).setHours(0, 0, 0, 0));
    return this.prisma.milestoneCompletion.upsert({
      where: {
        milestoneId_menteeId_date: { milestoneId, menteeId, date: normalizedDate },
      },
      update: {},
      create: { milestoneId, menteeId, date: normalizedDate },
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
