import { Controller, Get, Post, Put, Delete, Query, Param, UseGuards, Request, Body } from '@nestjs/common';
import { AdminService } from '../../application/admin.service';
import { SubscriptionService } from '../../../subscription/application/subscription.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { 
  CheckPermissions, 
  PermissionAction, 
  type AuthUser, 
  GetUser 
} from '@workshop/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard)
@CheckPermissions(PermissionAction.SAAS_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Get('stats')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('tenants')
  async getTenants(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listTenants({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('users')
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('roleId') roleId?: string,
  ) {
    return this.adminService.listUsers({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      roleId,
    });
  }

  @Get('tenants/:id')
  async getTenant(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Get('subscriptions')
  async getSubscriptions(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subscriptionService.listAllSubscriptions({
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get('subscriptions/stats')
  async getSubscriptionStats() {
    return this.subscriptionService.getAdminStats();
  }

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Post('plans')
  async createPlan(@Body() data: any) {
    return this.subscriptionService.createPlan(data);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.subscriptionService.deletePlan(id);
  }

  @Get('tenants/:tenantId/subscription-history')
  async getTenantHistory(@Param('tenantId') tenantId: string) {
    return this.subscriptionService.getTenantHistory(tenantId);
  }

  @Post('impersonate/:tenantId')
  async impersonate(@Param('tenantId') tenantId: string, @Request() req: any) {
    const adminUserId = req.user.sub;
    return this.adminService.impersonateTenant(tenantId, adminUserId);
  }
}
