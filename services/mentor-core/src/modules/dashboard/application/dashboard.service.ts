import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentDashboard(menteeId: string, scope: QueryScope) {
    const [profile, tasks, habits, sessions, groupMemberships] = await Promise.all([
      this.prisma.menteeProfile.findUnique({ where: { userId: menteeId } }),
      this.prisma.task.findMany({ where: { assigneeId: menteeId, status: { not: 'APPROVED' } } }),
      this.prisma.habit.findMany({ where: { assigneeId: menteeId, isActive: true }, include: { _count: { select: { checkins: true } } } }),
      this.prisma.session.findMany({ 
        where: { 
          scheduledAt: { gte: new Date() }
        }
      }),
      this.prisma.groupMember.findMany({ where: { menteeId } })
    ]);

    const groupIds = groupMemberships.map(m => m.groupId);
    const filteredSessions = sessions.filter(s => s.menteeId === menteeId || (s.groupId && groupIds.includes(s.groupId)));

    return { 
      profile, 
      pendingTasksCount: tasks.length, 
      activeHabitsCount: habits.length, 
      upcomingSessions: filteredSessions 
    };
  }

  async getCoachDashboard(scope: QueryScope) {
    const coachId = scope.userId;
    const [groups, tasksToReview, upcomingSessions] = await Promise.all([
      this.prisma.group.findMany({ where: { coachId } }),
      this.prisma.task.findMany({ where: { coachId, status: 'SUBMITTED' } }),
      this.prisma.session.findMany({ where: { coachId, scheduledAt: { gte: new Date() } } })
    ]);

    return { 
      managedGroupsCount: groups.length, 
      tasksToReviewCount: tasksToReview.length, 
      upcomingSessions 
    };
  }

  async getOwnerDashboard(scope: QueryScope) {
    const [totalMentees, programs, totalXp, coachesCount] = await Promise.all([
      this.prisma.menteeProfile.count({ where: { tenantId: scope.tenantId } }),
      this.prisma.program.findMany({ where: { tenantId: scope.tenantId } }),
      this.prisma.xpTransaction.aggregate({ where: { tenantId: scope.tenantId }, _sum: { amount: true } }),
      this.prisma.group.groupBy({ by: ['coachId'], where: { tenantId: scope.tenantId } })
    ]);

    return { 
      totalMentees, 
      totalPrograms: programs.length, 
      totalXpGenerated: totalXp._sum.amount || 0,
      activeCoachesCount: coachesCount.length
    };
  }
}
