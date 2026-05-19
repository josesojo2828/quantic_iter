import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TaskService } from '../../application/task.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';

@Controller('tasks')
@UseGuards(ScopeGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async findAll(@Req() req: any) {
    return this.taskService.getTasks(req.scope);
  }

  @Get('mentee/:menteeId')
  async findByMentee(@Param('menteeId') menteeId: string, @Req() req: any) {
    return this.taskService.getMenteeTasks(menteeId, req.scope);
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    return this.taskService.createTask(data, req.scope);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    return this.taskService.updateTaskStatus(id, status, req.scope);
  }
}
