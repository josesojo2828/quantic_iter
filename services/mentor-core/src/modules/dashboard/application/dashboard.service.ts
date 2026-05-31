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
    const [totalMentees, programs, totalXp, coachesCount, groups, tasks, sessions] = await Promise.all([
      this.prisma.menteeProfile.count({ where: { tenantId: scope.tenantId } }),
      this.prisma.program.findMany({ where: { tenantId: scope.tenantId } }),
      this.prisma.xpTransaction.aggregate({ where: { tenantId: scope.tenantId }, _sum: { amount: true } }),
      this.prisma.group.groupBy({ by: ['coachId'], where: { tenantId: scope.tenantId } }),
      this.prisma.group.findMany({ where: { tenantId: scope.tenantId }, include: { members: true } }),
      this.prisma.task.findMany({ where: { tenantId: scope.tenantId } }),
      this.prisma.session.findMany({ where: { tenantId: scope.tenantId } })
    ]);

    const coachStatsMap: Record<string, {
      coachId: string;
      assignedMentees: Set<string>;
      completedSessionsCount: number;
      pendingReviewsCount: number;
      createdProgramsCount: number;
    }> = {};

    groups.forEach(group => {
      if (!coachStatsMap[group.coachId]) {
        coachStatsMap[group.coachId] = {
          coachId: group.coachId,
          assignedMentees: new Set(),
          completedSessionsCount: 0,
          pendingReviewsCount: 0,
          createdProgramsCount: 0
        };
      }
      group.members.forEach(member => {
        coachStatsMap[group.coachId].assignedMentees.add(member.menteeId);
      });
    });

    programs.forEach(prog => {
      if (prog.coachId) {
        if (!coachStatsMap[prog.coachId]) {
          coachStatsMap[prog.coachId] = {
            coachId: prog.coachId,
            assignedMentees: new Set(),
            completedSessionsCount: 0,
            pendingReviewsCount: 0,
            createdProgramsCount: 0
          };
        }
        coachStatsMap[prog.coachId].createdProgramsCount++;
      }
    });

    tasks.forEach(task => {
      if (task.coachId) {
        if (!coachStatsMap[task.coachId]) {
          coachStatsMap[task.coachId] = {
            coachId: task.coachId,
            assignedMentees: new Set(),
            completedSessionsCount: 0,
            pendingReviewsCount: 0,
            createdProgramsCount: 0
          };
        }
        if (task.status === 'SUBMITTED') {
          coachStatsMap[task.coachId].pendingReviewsCount++;
        }
      }
    });

    sessions.forEach(sess => {
      if (sess.coachId) {
        if (!coachStatsMap[sess.coachId]) {
          coachStatsMap[sess.coachId] = {
            coachId: sess.coachId,
            assignedMentees: new Set(),
            completedSessionsCount: 0,
            pendingReviewsCount: 0,
            createdProgramsCount: 0
          };
        }
        if (sess.status === 'COMPLETED') {
          coachStatsMap[sess.coachId].completedSessionsCount++;
        }
      }
    });

    const staffPerformance = Object.values(coachStatsMap).map(stat => ({
      coachId: stat.coachId,
      assignedMenteesCount: stat.assignedMentees.size,
      completedSessionsCount: stat.completedSessionsCount,
      pendingReviewsCount: stat.pendingReviewsCount,
      createdProgramsCount: stat.createdProgramsCount,
      overallRating: 5
    }));

    return { 
      totalMentees, 
      totalPrograms: programs.length, 
      totalXpGenerated: totalXp._sum.amount || 0,
      activeCoachesCount: coachesCount.length,
      staffPerformance
    };
  }
}
