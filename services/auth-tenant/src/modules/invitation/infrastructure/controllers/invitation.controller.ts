import { Controller, Post, Get, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { InvitationService } from '../../application/invitation.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { CheckPermissions, PermissionAction, AuthUser, Public } from '@mentor/shared';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @CheckPermissions(PermissionAction.STAFF_CREATE)
  async sendInvitation(@Request() req: any, @Body() dto: { 
    email: string; 
    roleId?: string; 
    roleSlug?: string;
    tenantId?: string;
    branchId?: string;
  }) {
    const user = req.user as AuthUser;
    const tenantId = user.role === 'saas_admin' ? (dto.tenantId || user.tenantId) : user.tenantId;
    const branchId = (user.role !== 'mentor_owner' && user.role !== 'saas_admin') 
      ? (user.branchId || undefined) 
      : dto.branchId;

    return this.invitationService.createInvitation({
      ...dto,
      tenantId,
      branchId,
      invitedBy: user.userId,
    });
  }

  @Public()
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.invitationService.validateToken(token);
  }

  @Post('accept/:token')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Request() req: any, @Param('token') token: string) {
    // This is for existing users accepting an invite
    const invitation = await this.invitationService.acceptInvitation(token, req.user.userId);
    
    return {
      message: 'Te has unido al mentoria con exito',
      invitation,
    };
  }

  @Get('my/pending')
  @UseGuards(JwtAuthGuard)
  async getMyPendingInvitations(@Request() req: any) {
    const email = req.user.email;
    console.log('[BACKEND CONTROLADOR DEBUG] Solicitando invitaciones para el email extraído del token:', email);
    const result = await this.invitationService.getPendingInvitationsForEmail(email);
    console.log('[BACKEND CONTROLADOR DEBUG] Resultado retornado por el servicio:', result);
    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInvitations(@Request() req: any) {
    const user = req.user as AuthUser;
    return this.invitationService.getInvitationsByTenant(user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @CheckPermissions(PermissionAction.STAFF_DELETE)
  async cancelInvitation(@Param('id') id: string) {
    await this.invitationService.cancelInvitation(id);
    return { message: 'Invitacion cancelada con exito' };
  }
}
