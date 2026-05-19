import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from '../../application/dashboard.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('dashboards')
@UseGuards(ScopeGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student')
  async getStudent(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.dashboardService.getStudentDashboard(scope.userId, scope);
  }

  @Get('coach')
  async getCoach(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.dashboardService.getCoachDashboard(scope);
  }

  @Get('owner')
  async getOwner(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.dashboardService.getOwnerDashboard(scope);
  }
}
