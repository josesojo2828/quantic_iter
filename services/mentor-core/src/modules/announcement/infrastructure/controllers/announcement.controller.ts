import { Controller, Post, Get, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AnnouncementService } from '../../application/announcement.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('announcements')
@UseGuards(ScopeGuard)
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createAnnouncement({
      ...dto,
      tenantId: scope.tenantId,
      coachId: scope.userId,
    });
  }

  @Get()
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAnnouncements(scope);
  }

  @Get('program/:programId')
  async findByProgram(@Param('programId') programId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAnnouncementsByProgram(programId, scope);
  }

  @Get('group/:groupId')
  async findByGroup(@Param('groupId') groupId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAnnouncementsByGroup(groupId, scope);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.markAsRead(id, scope.userId, scope);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getStats(id, scope);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.deleteAnnouncement(id, scope);
  }
}
