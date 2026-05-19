import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Session, SessionAttendance } from '../../domain/session.entity';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Partial<Session>): Promise<Session> {
    return this.prisma.session.create({
      data: {
        tenantId: data.tenantId!,
        coachId: data.coachId!,
        groupId: data.groupId,
        menteeId: data.menteeId,
        type: data.type || 'ONE_ON_ONE',
        title: data.title!,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt!),
        duration: data.duration || 60,
        meetingUrl: data.meetingUrl,
        status: data.status || 'SCHEDULED',
      },
    }) as unknown as Session;
  }

  async findAll(scope: QueryScope): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: this.applyScope({}, scope),
      orderBy: { scheduledAt: 'asc' },
    }) as unknown as Session[];
  }

  async findByMentee(menteeId: string, scope: QueryScope): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: this.applyScope({
        OR: [
          { menteeId },
          { groupId: { not: null } },
        ],
      }, scope),
      orderBy: { scheduledAt: 'asc' },
    }) as unknown as Session[];
  }

  async findById(id: string, scope: QueryScope): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: this.applyScope({ id }, scope),
    }) as unknown as Session;
  }

  async recordAttendance(
    sessionId: string, 
    menteeId: string, 
    status: string, 
    method: string = 'MANUAL'
  ): Promise<SessionAttendance> {
    return this.prisma.sessionAttendance.upsert({
      where: {
        sessionId_menteeId: { sessionId, menteeId },
      },
      update: { 
        status,
        checkinTime: status === 'PRESENT' ? new Date() : null,
        checkinMethod: method,
      },
      create: { 
        sessionId, 
        menteeId, 
        status,
        checkinTime: status === 'PRESENT' ? new Date() : null,
        checkinMethod: method,
      },
    }) as unknown as SessionAttendance;
  }

  async getAttendance(sessionId: string): Promise<SessionAttendance[]> {
    return this.prisma.sessionAttendance.findMany({
      where: { sessionId },
    }) as unknown as SessionAttendance[];
  }

  async update(id: string, data: Partial<Session>, scope: QueryScope): Promise<Session> {
    return this.prisma.session.update({
      where: this.applyScope({ id }, scope),
      data,
    }) as unknown as Session;
  }
}
