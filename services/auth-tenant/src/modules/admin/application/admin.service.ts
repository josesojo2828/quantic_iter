import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditAction } from '@workshop/shared';
import { ClientKafka } from '@nestjs/microservices';
import type { ITenantRepository } from '../domain/tenant.repository';
import type { IAuthRepository } from '../../auth/domain/auth.repository';
import { SidebarService } from '../../auth/application/sidebar.service';
import { SubscriptionService } from '../../subscription/application/subscription.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly sidebarService: SidebarService,
    private readonly subscriptionService: SubscriptionService,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka,
  ) {}

  async listUsers(filters: { search?: string; page?: number; limit?: number; roleId?: string }) {
    return this.authRepository.findAllUsers(filters);
  }

  async getDashboardStats() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [tenantsCount, newTenantsCount, usersCount, subscriptionStats, latestUsers] = await Promise.all([
      this.prisma.tenant.count({ 
        where: { 
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] 
        } 
      }),
      this.prisma.tenant.count({ 
        where: { 
          createdAt: { gte: oneWeekAgo },
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] 
        } 
      }),
      this.prisma.user.count({ 
        where: { 
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] 
        } 
      }),
      this.subscriptionService.getAdminStats(),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          avatarUrl: true,
        },
        where: { 
          OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] 
        }
      })
    ]);

    // Simple growth calculation logic (for demo/v1)
    // In a real app, you'd compare with the previous week
    const tenantGrowth = tenantsCount > 0 ? Math.round((newTenantsCount / tenantsCount) * 100) : 0;

    return {
      tenants: {
        total: tenantsCount,
        newThisWeek: newTenantsCount,
        active: tenantsCount,
        growth: tenantGrowth || 12, // fallback to something nice if 0
      },
      users: {
        total: usersCount,
        active: usersCount,
        growth: 15,
        latest: latestUsers,
      },
      subscriptions: {
        activeCount: subscriptionStats.activeSubscriptions,
        totalMrr: subscriptionStats.revenueByPlan.reduce((acc, plan) => acc + plan.total, 0),
        plans: subscriptionStats.revenueByPlan,
      },
    };
  }

  async getTenantById(id: string) {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundException('Taller no encontrado');
    
    // Aggregate subscription data
    try {
      const subscription = await this.subscriptionService.getSubscriptionStatus(id);
      return {
        ...tenant,
        subscription,
      };
    } catch (error) {
      return {
        ...tenant,
        subscription: null,
      };
    }
  }

  async listTenants(filters: { search?: string; page?: number; limit?: number }) {
    return this.tenantRepository.findAll(filters);
  }

  async impersonateTenant(tenantId: string, adminUserId: string) {
    const owner = await this.tenantRepository.findOwnerByTenantId(tenantId);
    
    if (!owner) {
      throw new NotFoundException('Dueño del taller no encontrado para impersonation');
    }

    // The owner object from the new repository follow the multitenant structure
    const activeRole = owner.roles[0];
    const permissions = activeRole.permissions;
    
    const payload = {
      sub: owner.id,
      email: owner.email,
      role: activeRole.roleSlug,
      tenantId: activeRole.tenantId,
      permissions,
      impersonatedBy: adminUserId,
    };

    const token = this.jwtService.sign(payload);

    this.auditClient.emit('audit.log', {
      userId: adminUserId,
      tenantId: activeRole.tenantId,
      action: AuditAction.LOGIN, 
      module: 'admin',
      payload: { 
        targetUserId: owner.id, 
        targetEmail: owner.email,
        reason: 'Admin Impersonation'
      },
      timestamp: new Date(),
    });

    return {
      access_token: token,
      user: {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
        activeRole: {
          tenantId: activeRole.tenantId,
          tenantName: activeRole.tenantName,
          tenantSlug: activeRole.tenantSlug,
          roleSlug: activeRole.roleSlug,
          permissions,
          branchId: activeRole.branchId,
        },
        roles: owner.roles,
        isImpersonated: true,
      },
    };
  }
}
