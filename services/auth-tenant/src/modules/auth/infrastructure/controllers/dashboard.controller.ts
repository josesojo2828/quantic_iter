import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { CheckPermissions, PermissionAction, AuthUser } from '@workshop/shared';
import { StaffService } from '../../../staff/application/staff.service';
import { SubscriptionService } from '../../../subscription/application/subscription.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly staffService: StaffService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Get('metrics')
  async getMetrics(@Req() req: any) {
    const tenantId = req.user.tenantId;
    
    const { items: workers, total } = await this.staffService.findAll(tenantId, {});
    
    let subscription = null;
    try {
      subscription = tenantId ? await this.subscriptionService.getSubscriptionStatus(tenantId) : null;
    } catch (e) {
      // No subscription record yet
    }

    const planName = subscription?.plan?.name || 'Sin Plan';
    const planTrend = subscription?.nextPlan 
      ? `Próximo: ${subscription.nextPlan.name}` 
      : subscription ? 'Operativo' : 'Configura tu plan';
    const usersLimit = subscription?.usage?.users?.limit || '0';
    const usersCurrent = subscription?.usage?.users?.current || total;
    
    // We provide real data for what we have, and placeholders for what's coming (Works)
    return {
      stats: [
        { label: 'Trabajadores Activos', value: total.toString(), trend: '+0', trendType: 'up' },
        { label: 'Plan Activo', value: planName, trend: planTrend, trendType: 'up' },
        { label: 'Uso de Licencia', value: `${usersCurrent}/${usersLimit}`, trend: 'Usuarios', trendType: 'up' },
        { label: 'Estado Global', value: 'Operativo', trend: 'OK', trendType: 'up' },
      ],



      recentRepairs: [
        // This will be replaced by real data once the Work module is implemented
        { id: 'QM-101', vehicle: 'Toyota Corolla', client: 'Marcos Rodriguez', status: 'En Proceso', time: '2h' },
        { id: 'QM-102', vehicle: 'Ford Raptor', client: 'Andres Peralta', status: 'Diagnóstico', time: '1h' },
      ],

      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        usage: subscription.usage,
        plan: {
          name: subscription.plan.name,
          slug: subscription.plan.slug,
          price: subscription.plan.price,
          config: subscription.plan.config,
        },
        nextPlan: subscription.nextPlan ? {
          name: subscription.nextPlan.name,
          slug: subscription.nextPlan.slug,
          price: subscription.nextPlan.price,
        } : null
      } : null


    };
  }
}

