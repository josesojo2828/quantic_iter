import { Controller, Get, Put, Post, Req, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';

@Controller('tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async getTenant(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.authService.getTenant(tenantId);
  }

  @Put('me')
  async updateTenant(@Req() req: any, @Body() dto: any) {
    const tenantId = req.user.tenantId;
    // Basic verification: Only mentor_owner should update tenant info
    // For now, we trust the tenantId in the token
    return this.authService.updateTenant(tenantId, dto);
  }

  @Post('leave')
  async leaveTenant(@Req() req: any, @Body() body: { tenantId: string }) {
    const userId = req.user.userId;
    return this.authService.leaveTenant(userId, body.tenantId);
  }
}
