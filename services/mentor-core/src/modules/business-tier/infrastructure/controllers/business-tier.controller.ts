import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BusinessTierService } from '../../application/business-tier.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('business-tiers')
@UseGuards(ScopeGuard)
export class BusinessTierController {
  constructor(private readonly service: BusinessTierService) {}

  @Post()
  async createTier(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createTier({
      ...dto,
      tenantId: scope.tenantId,
    });
  }

  @Get()
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getTiers(scope);
  }

  @Post('subscribe/:tierId')
  async subscribeMe(@Param('tierId') tierId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.subscribeMentee(scope.userId, tierId, scope);
  }

  @Post('subscribe/:tierId/mentee/:menteeId')
  async subscribeMentee(
    @Param('tierId') tierId: string, 
    @Param('menteeId') menteeId: string, 
    @Req() req: Request
  ) {
    const scope = (req as any).scope;
    return this.service.subscribeMentee(menteeId, tierId, scope);
  }

  @Get('subscriptions/me')
  async getMySubscriptions(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getMenteeSubscriptions(scope.userId, scope);
  }

  @Get('subscriptions/mentee/:menteeId')
  async getMenteeSubscriptions(@Param('menteeId') menteeId: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getMenteeSubscriptions(menteeId, scope);
  }
}
