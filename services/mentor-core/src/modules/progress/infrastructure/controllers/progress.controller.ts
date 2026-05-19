import { Controller, Post, Get, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ProgressService } from '../../application/progress.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('progress')
@UseGuards(ScopeGuard)
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('timeline/:menteeId')
  async getTimeline(@Param('menteeId') menteeId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getTimeline(menteeId, scope);
  }

  @Get('score/:menteeId')
  async getScore(@Param('menteeId') menteeId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getProgressScore(menteeId, scope);
  }

  @Post('milestones')
  async createMilestone(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createMilestone({
      ...dto,
      tenantId: scope.tenantId,
    });
  }

  @Get('milestones/program/:programId')
  async getMilestones(@Param('programId') programId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getProgramMilestones(programId, scope);
  }

  @Post('milestones/:id/complete')
  async completeMilestone(
    @Param('id') id: string,
    @Body() dto: { menteeId: string, date?: string },
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    const date = dto.date ? new Date(dto.date) : undefined;
    return this.service.completeMilestone(id, dto.menteeId, scope, date);
  }
}
