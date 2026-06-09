import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Measurement } from '../../domain/measurement.entity';

@Injectable()
export class MeasurementRepository extends BaseRepository<Measurement> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Partial<Measurement>): Promise<Measurement> {
    return this.prisma.measurement.create({
      data: {
        tenantId: data.tenantId!,
        menteeId: data.menteeId!,
        coachId: data.coachId!,
        type: data.type!,
        value: data.value!,
        unit: data.unit!,
        notes: data.notes,
        date: data.date || new Date(),
      },
    }) as unknown as Measurement;
  }

  async findByMentee(menteeId: string, scope: QueryScope): Promise<Measurement[]> {
    return this.prisma.measurement.findMany({
      where: this.applyScope({ menteeId }, scope),
      orderBy: { date: 'desc' },
    }) as unknown as Measurement[];
  }

  async findAll(scope: QueryScope): Promise<Measurement[]> {
    return this.prisma.measurement.findMany({
      where: this.applyScope({}, scope),
      orderBy: { date: 'desc' },
    }) as unknown as Measurement[];
  }

  async delete(id: string, scope: QueryScope): Promise<boolean> {
    const deleted = await this.prisma.measurement.deleteMany({
      where: this.applyScope({ id }, scope),
    });
    return deleted.count > 0;
  }
}
