import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { AuthService } from '../../application/auth.service';
import { SubscriptionService } from '../../application/subscription.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly authService: AuthService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @Get('metrics')
  async getMetrics(@Req() req: any) {
    const tenantId = req.user.tenantId;
    
    const workers = await this.authService.getWorkers(tenantId);
    
    let subscription = null;
    try {
      subscription = tenantId ? await this.subscriptionService.getSubscriptionStatus(tenantId) : null;
    } catch (e) {
      // No subscription record yet
    }

    const planName = subscription?.plan?.name || 'Sin Plan';
    const usersLimit = subscription?.usage?.users?.limit || '0';
    const usersCurrent = subscription?.usage?.users?.current || workers.length;
    
    // We provide real data for what we have, and placeholders for what's coming (Works)
    return {
      stats: [
        { label: 'Trabajadores Activos', value: workers.length.toString(), trend: '+0', trendType: 'up' },
        { label: 'Plan Activo', value: planName, trend: subscription ? 'Renueva pronto' : 'Configura tu plan', trendType: 'up' },
        { label: 'Uso de Licencia', value: `${usersCurrent}/${usersLimit}`, trend: 'Usuarios', trendType: 'up' },
        { label: 'Estado Global', value: 'Operativo', trend: 'OK', trendType: 'up' },
      ],

      recentRepairs: [
        // This will be replaced by real data once the Work module is implemented
        { id: 'QM-101', vehicle: 'Toyota Corolla', client: 'Marcos Rodriguez', status: 'En Proceso', time: '2h' },
        { id: 'QM-102', vehicle: 'Ford Raptor', client: 'Andres Peralta', status: 'Diagnóstico', time: '1h' },
      ]
    };
  }
}
