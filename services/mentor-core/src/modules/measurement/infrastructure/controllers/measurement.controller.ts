import { Controller, Post, Get, Body, Param, UseGuards, Req, Query, Delete } from '@nestjs/common';
import { MeasurementService } from '../../application/measurement.service';
import { MeasurementAnalyticsService } from '../../application/measurement-analytics.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('measurements')
@UseGuards(ScopeGuard)
export class MeasurementController {
  constructor(
    private readonly service: MeasurementService,
    private readonly analyticsService: MeasurementAnalyticsService,
  ) {}

  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createMeasurement({
      ...dto,
      tenantId: scope.tenantId,
      coachId: scope.userId,
    });
  }

  @Get()
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAllMeasurements(scope);
  }

  @Get('mentee/:menteeId')
  async findByMentee(@Param('menteeId') menteeId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getMenteeMeasurements(menteeId, scope);
  }

  @Get('mentee/:menteeId/evolution')
  async getEvolution(
    @Param('menteeId') menteeId: string,
    @Query('indicator') indicator: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.analyticsService.getEvolution(
      menteeId, 
      indicator, 
      scope,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('evolution/me')
  async getMyEvolution(
    @Query('indicator') indicator: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.analyticsService.getEvolution(
      scope.userId, 
      indicator, 
      scope,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('program/:programId/comparison')
  async getComparison(
    @Param('programId') programId: string,
    @Query('indicator') indicator: string,
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.analyticsService.getComparison(indicator, scope);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.deleteMeasurement(id, scope);
  }
}
