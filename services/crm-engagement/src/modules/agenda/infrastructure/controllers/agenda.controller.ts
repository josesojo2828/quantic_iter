import { Controller, Get, Post, Body, Param, Put, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { AgendaService } from '../../application/agenda.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';

@Controller('agenda')
@UseGuards(LocalAuthGuard)
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post('events')
  async createEvent(@Req() req: any, @Body() dto: {
    title?: string;
    description?: string;
    start: string;
    end: string;
    contactId?: string;
    guestIds?: string[];
    groupIds?: string[];
    resourceId?: string;
    coreReferenceId?: string;
    metadata?: any;
  }) {
    const tenantId = req.user.tenantId;
    return this.agendaService.createEvent({
      ...dto,
      tenantId,
      start: new Date(dto.start),
      end: new Date(dto.end),
    });
  }

  @Get('events')
  async getEvents(
    @Req() req: any,
    @Query('date') date: string,
    @Query('resourceId') resourceId?: string
  ) {
    const tenantId = req.user.tenantId;
    return this.agendaService.getEvents(tenantId, new Date(date), resourceId);
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() data: any) {
    if (data.start) data.start = new Date(data.start);
    if (data.end) data.end = new Date(data.end);
    return this.agendaService.updateEvent(id, data);
  }

  @Put('events/:id/cancel')
  async cancelEvent(@Param('id') id: string) {
    return this.agendaService.cancelEvent(id);
  }

  @Get('upcoming')
  async getUpcoming(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.agendaService.getUpcomingEvent(tenantId);
  }

  @Get('metrics')
  async getMetrics(
    @Req() req: any,
    @Query('date') date: string
  ) {
    const tenantId = req.user.tenantId;
    return this.agendaService.getDayMetrics(tenantId, new Date(date));
  }

  @Get('busy-days')
  async getBusyDays(
    @Req() req: any,
    @Query('month') month: number,
    @Query('year') year: number
  ) {
    const tenantId = req.user.tenantId;
    return this.agendaService.getBusyDays(tenantId, month, year);
  }
}
