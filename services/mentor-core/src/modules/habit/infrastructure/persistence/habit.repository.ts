import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Habit, HabitCheckin } from '@prisma/client';

@Injectable()
export class HabitRepository extends BaseRepository<Habit> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(scope: QueryScope): Promise<Habit[]> {
    return this.prisma.habit.findMany({
      where: this.applyScope({}, scope, { menteeField: 'assigneeId' }),
      include: { checkins: true },
    });
  }

  async findOne(id: string, scope: QueryScope): Promise<Habit | null> {
    return this.prisma.habit.findFirst({
      where: this.applyScope({ id }, scope, { menteeField: 'assigneeId' }),
      include: { checkins: true },
    });
  }

  async findByMentee(menteeId: string, scope: QueryScope): Promise<Habit[]> {
    return this.prisma.habit.findMany({
      where: this.applyScope({ assigneeId: menteeId }, scope, { menteeField: 'assigneeId' }),
      include: { checkins: true },
    });
  }

  async create(data: any, scope: QueryScope): Promise<Habit> {
    const { title, name, ...habitData } = data;
    return this.prisma.habit.create({
      data: {
        ...habitData,
        name: name || title || 'Nuevo Hábito',
        assigneeId: data.assigneeId || scope.userId,
        tenantId: scope.tenantId!,
        coachId: data.coachId || scope.coachId || scope.userId,
      },
    });
  }

  async checkin(habitId: string, date: Date, scope: QueryScope): Promise<HabitCheckin> {
    // Normalizar fecha a las 00:00 UTC para evitar duplicados en el mismo día
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    return this.prisma.habitCheckin.upsert({
      where: {
        habitId_date: {
          habitId,
          date: normalizedDate,
        },
      },
      update: {},
      create: {
        habitId,
        date: normalizedDate,
      },
    });
  }
}
