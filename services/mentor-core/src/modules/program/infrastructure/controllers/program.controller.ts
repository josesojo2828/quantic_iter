import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProgramService } from '../../application/program.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { SubscriptionActiveGuard } from '../../../../common/guards/subscription-active.guard';

@Controller('programs')
@UseGuards(ScopeGuard, SubscriptionActiveGuard)
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.programService.getPrograms(req.scope);
  }

  @Get('marketplace')
  async getMarketplace() {
    return this.programService.getMarketplace();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.programService.getProgram(id, req.scope);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.programService.createProgram(data, req.scope);
  }

  @Post(':id/coach') // Usamos POST para mayor compatibilidad con scripts, o PATCH
  async assignCoach(@Param('id') id: string, @Body('coachId') coachId: string, @Req() req: any) {
    return this.programService.assignCoach(id, coachId, req.scope);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() body: { menteeId: string; objectiveId?: string; newObjective?: any },
    @Req() req: any
  ) {
    return this.programService.assign(id, body.menteeId, req.scope, {
      objectiveId: body.objectiveId,
      newObjective: body.newObjective,
    });
  }

  @Post(':id/clone')
  async clone(@Param('id') id: string, @Req() req: any) {
    return this.programService.cloneProgram(id, req.scope);
  }

  // --- GESTIÓN DE FASES ---
  @Post(':id/phases')
  async addPhase(@Param('id') id: string, @Body() data: any) {
    return this.programService.addPhase(id, data);
  }

  @Post(':id/phases/:phaseId') // PATCH fallback for some clients
  async updatePhase(@Param('phaseId') phaseId: string, @Body() data: any) {
    return this.programService.updatePhase(phaseId, data);
  }

  @Get(':id/phases/:phaseId/delete') // DELETE fallback
  async deletePhase(@Param('phaseId') phaseId: string) {
    return this.programService.deletePhase(phaseId);
  }

  // --- GESTIÓN DE HITOS (MILESTONES) ---
  @Post(':id/phases/:phaseId/milestones')
  async addMilestone(
    @Param('id') programId: string,
    @Param('phaseId') phaseId: string,
    @Body() data: any,
    @Req() req: any
  ) {
    return this.programService.addMilestone(programId, phaseId, data, req.scope);
  }

  @Post(':id/phases/:phaseId/milestones/:milestoneId')
  async updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() data: any
  ) {
    return this.programService.updateMilestone(milestoneId, data);
  }

  @Get(':id/phases/:phaseId/milestones/:milestoneId/delete')
  async deleteMilestone(@Param('milestoneId') milestoneId: string) {
    return this.programService.deleteMilestone(milestoneId);
  }

  @Post(':id/milestones/:milestoneId/toggle')
  async toggleMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body('date') date: string,
    @Req() req: any
  ) {
    const toggleDate = date ? new Date(date) : undefined;
    return this.programService.toggleMilestone(id, milestoneId, req.scope, toggleDate);
  }

  @Post(':id/milestones/:milestoneId/subtasks/toggle')
  async toggleSubTask(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body('title') title: string,
    @Body('index') index: number,
    @Body('isCompleted') isCompleted: boolean,
    @Req() req: any
  ) {
    return this.programService.toggleSubTask(milestoneId, title, isCompleted, index);
  }

  @Post(':id/phases/:phaseId/toggle')
  async togglePhase(
    @Param('id') id: string,
    @Param('phaseId') phaseId: string,
    @Body('date') date: string,
    @Req() req: any
  ) {
    const toggleDate = date ? new Date(date) : undefined;
    return this.programService.togglePhase(id, phaseId, req.scope, toggleDate);
  }
}
