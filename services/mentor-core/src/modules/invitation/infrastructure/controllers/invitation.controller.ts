import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { InvitationService } from '../../application/invitation.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly service: InvitationService) {}

  @Post()
  @UseGuards(ScopeGuard)
  async create(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createInvitation(dto, scope);
  }

  @Get()
  @UseGuards(ScopeGuard)
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.listInvitations(scope);
  }

  @Get('validate/:token')
  async validate(@Param('token') token: string) {
    return this.service.validateToken(token);
  }

  @Post('accept/:token')
  async accept(@Param('token') token: string, @Body() dto: { menteeId: string }) {
    return this.service.acceptInvitation(token, dto.menteeId);
  }
}
