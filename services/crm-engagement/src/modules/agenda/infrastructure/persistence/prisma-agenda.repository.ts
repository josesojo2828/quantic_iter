import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import { IAgendaRepository } from '../../domain/agenda.repository';

@Injectable()
export class PrismaAgendaRepository implements IAgendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: any) {
    return this.prisma.agendaEvent.create({ data });
  }

  async findEvents(filter: { 
    tenantId: string; 
    resourceId?: string; 
    start?: { gte?: Date; lte?: Date };
    status?: string;
  }) {
    return this.prisma.agendaEvent.findMany({
      where: {
        tenantId: filter.tenantId,
        ...(filter.resourceId && { resourceId: filter.resourceId }),
        ...(filter.status && { status: filter.status }),
        ...(filter.start && { start: filter.start }),
      },
      include: { contact: true, review: true },
      orderBy: { start: 'asc' },
    });
  }

  async findEventById(id: string) {
    return this.prisma.agendaEvent.findUnique({
      where: { id },
      include: { contact: true, review: true },
    });
  }

  async updateEvent(id: string, data: any) {
    return this.prisma.agendaEvent.update({
      where: { id },
      data,
    });
  }

  async deleteEvent(id: string) {
    return this.prisma.agendaEvent.delete({
      where: { id },
    });
  }

  async findEventsByContact(contactId: string) {
    return this.prisma.agendaEvent.findMany({
      where: { contactId },
      orderBy: { start: 'desc' },
    });
  }
}
