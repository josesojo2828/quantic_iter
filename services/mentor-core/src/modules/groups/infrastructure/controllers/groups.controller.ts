import { Controller, Get, Post, Put, Delete, Body, UseGuards, Req, Param } from '@nestjs/common';
import { GroupsService } from '../../application/groups.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';

@Controller('groups')
@UseGuards(ScopeGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.groupsService.getGroups(req.scope);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.groupsService.createGroup(data, req.scope);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getGroup(id, req.scope);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.groupsService.updateGroup(id, data, req.scope);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.deleteGroup(id, req.scope);
  }

  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: { menteeId: string }, @Req() req: any) {
    return this.groupsService.addMember(id, dto.menteeId, req.scope);
  }

  @Delete(':id/members/:menteeId')
  async removeMember(@Param('id') id: string, @Param('menteeId') menteeId: string, @Req() req: any) {
    return this.groupsService.removeMember(id, menteeId, req.scope);
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getMembers(id, req.scope);
  }

  @Post(':id/coach')
  async assignCoach(@Param('id') id: string, @Body('coachId') coachId: string, @Req() req: any) {
    return this.groupsService.assignCoach(id, coachId, req.scope);
  }
}

