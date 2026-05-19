import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IAgendaRepository } from '../domain/agenda.repository';
import { AuditAction } from '@mentor/shared';

@Injectable()
export class AgendaService {
  constructor(
    @Inject('IAgendaRepository')
    private readonly agendaRepository: IAgendaRepository,
    @Inject('IEventBus')
    private readonly eventBus: { emit: (topic: string, data: any) => Promise<void> }
  ) {}

  async createEvent(dto: {
    tenantId: string;
    title?: string;
    description?: string;
    start: Date;
    end: Date;
    contactId?: string;
    guestIds?: string[];
    groupIds?: string[];
    resourceId?: string;
    coreReferenceId?: string;
    metadata?: any;
  }) {
    const event = await this.agendaRepository.createEvent({
      ...dto,
      status: 'CONFIRMED'
    });

    await this.emitAudit(dto.tenantId, 'system', AuditAction.CREATE, 'agenda.event', event);

    return event;
  }

  async getEvents(tenantId: string, date: Date, resourceId?: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.agendaRepository.findEvents({
      tenantId,
      resourceId,
      start: { gte: start, lte: end }
    });
  }

  async updateEvent(id: string, data: any) {
    const event = await this.agendaRepository.findEventById(id);
    if (!event) throw new NotFoundException('Event not found');

    const updated = await this.agendaRepository.updateEvent(id, data);
    await this.emitAudit(event.tenantId, 'system', AuditAction.UPDATE_PARTIAL, 'agenda.event', { id, ...data });

    return updated;
  }

  async cancelEvent(id: string) {
    const event = await this.agendaRepository.findEventById(id);
    if (!event) throw new NotFoundException('Event not found');

    const updated = await this.agendaRepository.updateEvent(id, { status: 'CANCELLED' });
    await this.emitAudit(event.tenantId, 'system', AuditAction.UPDATE_PARTIAL, 'agenda.event', { id, status: 'CANCELLED' });

    return updated;
  }

  async getUpcomingEvent(tenantId: string) {
    const now = new Date();
    const events = await this.agendaRepository.findEvents({
      tenantId,
      start: { gte: now },
      status: 'CONFIRMED'
    });
    
    return events[0] || null;
  }

  async getDayMetrics(tenantId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const events = await this.agendaRepository.findEvents({
      tenantId,
      start: { gte: start, lte: end }
    });

    const workDayMinutes = 10 * 60; // 08:00 to 18:00 = 10 hours
    let occupiedMinutes = 0;

    events.forEach(e => {
      if (e.status === 'CONFIRMED') {
        const duration = (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000;
        occupiedMinutes += duration;
      }
    });

    const occupancy = Math.min(Math.round((occupiedMinutes / workDayMinutes) * 100), 100);

    return {
      totalEvents: events.length,
      occupancyPercentage: occupancy,
      estimatedRevenue: events.length * 45000,
    };
  }

  async getBusyDays(tenantId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await this.agendaRepository.findEvents({
      tenantId,
      start: { gte: start, lte: end },
      status: 'CONFIRMED'
    });

    const busyDates = new Set<string>();
    events.forEach(e => {
      const d = new Date(e.start);
      busyDates.add(d.toISOString().split('T')[0]);
    });

    return Array.from(busyDates);
  }

  private async emitAudit(tenantId: string, userId: string, action: AuditAction, module: string, payload: any) {
    try {
      await this.eventBus.emit('audit-log', {
        tenantId,
        userId,
        action,
        module,
        payload,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to emit audit log:', error);
    }
  }
}
