import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { SessionService } from '../../application/session.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('sessions')
@UseGuards(ScopeGuard)
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createSession({
      ...dto,
      tenantId: scope.tenantId,
      coachId: scope.userId,
    });
  }

  @Get()
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAllSessions(scope);
  }

  @Get('mentee/:menteeId')
  async findByMentee(@Param('menteeId') menteeId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getMenteeSessions(menteeId, scope);
  }

  @Post(':id/attendance')
  async recordAttendance(
    @Param('id') sessionId: string,
    @Body() dto: { menteeId?: string; status?: string; attendees?: { menteeId: string; status: string }[] },
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    
    if (dto.attendees && Array.isArray(dto.attendees)) {
      const results = [];
      for (const att of dto.attendees) {
        results.push(await this.service.recordAttendance(sessionId, att.menteeId, att.status, scope));
      }
      return { success: true, count: results.length, attendees: results };
    }
    
    return this.service.recordAttendance(sessionId, dto.menteeId!, dto.status!, scope);
  }

  @Get(':id/attendance')
  async getAttendance(@Param('id') sessionId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getSessionAttendance(sessionId, scope);
  }

  @Patch(':id/notes')
  async updateNotes(
    @Param('id') id: string,
    @Body() dto: { notes: string; isPrivate: boolean },
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.service.updateNotes(id, dto.notes, dto.isPrivate, scope);
  }

  @Post(':id/feedback')
  async addFeedback(
    @Param('id') id: string,
    @Body() dto: { rating: number; comment: string },
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.service.addFeedback(id, dto.rating, dto.comment, scope);
  }

  @Get(':id/qr-token')
  async getQrToken(@Param('id') sessionId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return { token: await this.service.generateQrToken(sessionId, scope.userId, scope) };
  }

  @Post(':id/qr-checkin')
  async validateQrCheckin(
    @Param('id') sessionId: string,
    @Body() dto: { token: string },
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.service.validateQrCheckin(sessionId, dto.token, scope);
  }
}
