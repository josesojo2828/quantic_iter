import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ObjectiveService } from '../../application/objective.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';

@Controller('objectives')
@UseGuards(ScopeGuard)
export class ObjectiveController {
  constructor(private readonly objectiveService: ObjectiveService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.objectiveService.getObjectives(req.scope);
  }

  @Get('mentee/:menteeId')
  async findByMentee(@Param('menteeId') menteeId: string, @Req() req: any) {
    return this.objectiveService.getMenteeObjectives(menteeId, req.scope);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.objectiveService.createObjective(data, req.scope);
  }
}
