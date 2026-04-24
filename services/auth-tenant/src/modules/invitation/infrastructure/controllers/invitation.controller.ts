import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvitationService } from '../../application/invitation.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { CheckPermissions, PermissionAction, AuthUser } from '@workshop/shared';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @CheckPermissions(PermissionAction.STAFF_CREATE, PermissionAction.SAAS_ADMIN)
  async sendInvitation(@Request() req: any, @Body() dto: { 
    email: string; 
    roleId: string; 
    tenantId?: string;
    branchId?: string;
  }) {
    const user = req.user as AuthUser;
    const tenantId = user.role === 'saas_admin' ? (dto.tenantId || user.tenantId) : user.tenantId;
    const branchId = (user.role !== 'workshop_owner' && user.role !== 'saas_admin') 
      ? (user.branchId || undefined) 
      : dto.branchId;

    return this.invitationService.createInvitation({
      ...dto,
      tenantId,
      branchId,
      invitedBy: user.userId,
    });
  }

  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.invitationService.validateToken(token);
  }

  @Post('accept/:token')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Request() req: any, @Param('token') token: string) {
    // This is for existing users accepting an invite
    const invitation = await this.invitationService.acceptInvitation(token);
    
    // TODO: Add logic to link req.user.userId to invitation.tenantId/branchId
    return {
      message: 'Te has unido al taller con éxito',
      invitation,
    };
  }
}
