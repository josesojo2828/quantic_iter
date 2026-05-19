import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { HabitService } from '../../application/habit.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';

@Controller('habits')
@UseGuards(ScopeGuard)
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.habitService.getHabits(req.scope);
  }

  @Get('mentee/:menteeId')
  async findByMentee(@Param('menteeId') menteeId: string, @Req() req: any) {
    return this.habitService.getMenteeHabits(menteeId, req.scope);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.habitService.createHabit(data, req.scope);
  }

  @Post(':id/checkin')
  async checkin(@Param('id') id: string, @Body('date') date: string, @Req() req: any) {
    const checkinDate = date ? new Date(date) : new Date();
    return this.habitService.recordCheckin(id, checkinDate, req.scope);
  }
}
