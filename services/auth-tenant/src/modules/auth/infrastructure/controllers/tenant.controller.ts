import { Controller, Get, Put, Req, Body, UseGuards } from '@nestjs/common';
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
    // Basic verification: Only workshop_owner should update tenant info
    // For now, we trust the tenantId in the token
    return this.authService.updateTenant(tenantId, dto);
  }
}
