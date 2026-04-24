import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuditAction } from '@workshop/shared';
import { ClientKafka } from '@nestjs/microservices';
import type { IAuthRepository } from '../domain/auth.repository';
import type { RegisterData } from '../domain/auth.repository';
import { SubscriptionService } from '../../subscription/application/subscription.service';
import { SidebarService } from './sidebar.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly sidebarService: SidebarService,
    private jwtService: JwtService,
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientKafka,
  ) {}

  private readonly AVATAR_POOL = [
    'avatar_female_1.png',
    'avatar_male_1.png',
    'avatar_neutral_1.png',
    'avatar_female_2.png',
    'avatar_male_2.png',
    'avatar_female_3.png',
    'avatar_male_3.png',
    'avatar_female_4.png',
    'avatar_male_4.png',
    'avatar_female_5.png',
    'avatar_male_5.png',
    'avatar_neutral_2.png',
    'avatar_female_6.png',
    'avatar_female_7.png',
    'avatar_male_6.png',
    'avatar_neutral_3.png',
  ];

  private getRandomAvatar(): string {
    const randomIndex = Math.floor(Math.random() * this.AVATAR_POOL.length);
    return this.AVATAR_POOL[randomIndex];
  }


  async register(dto: RegisterData) {
    try {
      const existing = await this.authRepository.findByEmail(dto.email);
      if (existing) throw new BadRequestException('El email ya está registrado');

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      
      const role = await this.authRepository.findRoleBySlug('workshop_owner');
      
      if (!role) {
        throw new NotFoundException('Rol "workshop_owner" no encontrado.');
      }

      const user = await this.authRepository.createTenantAndOwner({
        ...dto,
        password: hashedPassword,
        roleId: role.id,
        avatarUrl: this.getRandomAvatar(),
      });

      // The Multitenant User Entity now has roles[0] as the primary one after registration
      const primaryTenantId = user.roles[0].tenantId;

      // 1.5 Auto-subscribe to the basic plan (Trial/Free tier)
      try {
        await this.subscriptionService.subscribeToPlan(primaryTenantId, user.id, 'basic');
      } catch (subError) {
        console.error('Failed to auto-subscribe tenant to basic plan:', subError);
      }

      this.auditClient.emit('audit.log', {
        userId: user.id,
        tenantId: primaryTenantId,
        action: AuditAction.REGISTER,
        module: 'auth',
        payload: { email: user.email },
        timestamp: new Date(),
      });

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.authRepository.findByEmail(loginDto.email);
    
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isSuperAdmin = user.roles.some(r => r.roleSlug === 'super_admin') || user.email === 'admin@quantic.app';

    console.log(`[AuthService] User ${user.email} roles:`, user.roles.map(r => r.roleSlug));
    console.log(`[AuthService] isSuperAdmin: ${isSuperAdmin}`);

    if (!isSuperAdmin && (!user.roles || user.roles.length === 0)) {
      throw new UnauthorizedException('El usuario no tiene talleres asociados');
    }

    // Determine Active Context
    let activeRole = user.roles.find(r => r.tenantId === user.lastTenantId) || user.roles[0];
    
    const roleSlug = activeRole?.roleSlug || 'super_admin';
    let permissions = activeRole?.permissions || [];
    
    // Inject permissions for lifeboat admin if missing
    if (user.email === 'admin@quantic.app' && permissions.length === 0) {
      permissions = ['saas:admin', 'auth:login', 'auth:register', 'workshop:read', 'workshop:update', 'staff:read', 'staff:create'];
    }

    const tenantId = activeRole?.tenantId || 'global';
    
    let subStatus = null;
    if (tenantId && tenantId !== 'global') {
      try {
        subStatus = await this.subscriptionService.getSubscriptionStatus(tenantId);
      } catch (e) {
        // Default to null
      }
    }

    const planConfig = subStatus?.config || subStatus?.plan?.config || {};
    const modules = this.sidebarService.getModulesForUser(roleSlug, permissions, planConfig);

    const payload = {
      userId: user.id,
      email: user.email,
      role: roleSlug,
      tenantId: tenantId,
      permissions,
      plan: subStatus?.plan?.slug || 'free',
    };

    console.log(`[AuthService] 💡 Generating JWT for ${user.email}. Permissions: ${permissions.join(', ')}`);
    const token = this.jwtService.sign(payload);

    this.auditClient.emit('audit.log', {
      userId: user.id,
      tenantId: tenantId,
      action: AuditAction.LOGIN,
      module: 'auth',
      payload: { email: user.email },
      timestamp: new Date(),
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: roleSlug,
        permissions: permissions,
        activeRole: {
          tenantId,
          tenantName: activeRole?.tenantName || 'Global',
          tenantSlug: activeRole?.tenantSlug || 'global',
          roleSlug,
          permissions,
          branchId: activeRole?.branchId,
        },
        roles: user.roles || [],
        modules,
      },
    };
  }

  async switchContext(userId: string, targetTenantId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const targetRole = user.roles.find(r => r.tenantId === targetTenantId);
    if (!targetRole) {
      throw new UnauthorizedException('No tienes acceso a este taller');
    }

    // Update last tenant context
    await this.authRepository.updateUser(userId, { lastTenantId: targetTenantId } as any);

    const roleSlug = targetRole.roleSlug;
    let permissions = targetRole.permissions;

    // Inject permissions for lifeboat admin if missing
    if (user.email === 'admin@quantic.app' && permissions.length === 0) {
      permissions = ['saas:admin', 'auth:login', 'auth:register', 'workshop:read', 'workshop:update', 'staff:read', 'staff:create'];
    }

    let subStatus = null;
    if (targetTenantId && targetTenantId !== 'global') {
      try {
        subStatus = await this.subscriptionService.getSubscriptionStatus(targetTenantId);
      } catch (e) {
        // Default to null
      }
    }
    const planConfig = subStatus?.plan?.config || {};
    const modules = this.sidebarService.getModulesForUser(roleSlug, permissions, planConfig);

    const payload = {
      userId: user.id,
      sub: user.id,
      email: user.email,
      role: roleSlug,
      tenantId: targetTenantId,
      permissions,
      plan: subStatus?.plan?.slug || 'free',
    };

    console.log(`[AuthService] 💡 Context Switch JWT for ${user.email}. Permissions: ${permissions.join(', ')}`);
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleSlug,
        permissions: permissions,
        activeRole: {
          tenantId: targetTenantId,
          tenantName: targetRole?.tenantName || 'Global',
          tenantSlug: targetRole?.tenantSlug || 'global',
          roleSlug,
          permissions,
          branchId: targetRole?.branchId,
          subscription: subStatus,
        },
        roles: user.roles || [],
        modules,
      },
    };
  }

  async getProfileWithModules(userId: string, activeTenantId?: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (!user.roles || user.roles.length === 0) {
      throw new UnauthorizedException('El usuario no tiene talleres asociados');
    }

    // Determine Active Context
    const tenantId = activeTenantId || user.lastTenantId || user.roles[0].tenantId;
    const activeRole = user.roles.find(r => r.tenantId === tenantId) || user.roles[0];

    const roleSlug = activeRole.roleSlug;
    let permissions = activeRole.permissions;

    // Inject permissions for lifeboat admin if missing
    if (user.email === 'admin@quantic.app' && permissions.length === 0) {
      permissions = ['saas:admin', 'auth:login', 'auth:register', 'workshop:read', 'workshop:update', 'staff:read', 'staff:create'];
    }

    let subStatus = null;
    if (tenantId && tenantId !== 'global') {
      try {
        subStatus = await this.subscriptionService.getSubscriptionStatus(tenantId);
      } catch (e) {
        // If subscription doesn't exist yet, we continue with empty features
      }
    }

    const planConfig = subStatus?.plan?.config || {};
    const modules = this.sidebarService.getModulesForUser(roleSlug, permissions, planConfig);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      role: roleSlug,
      permissions: permissions,
      activeRole: {
        tenantId,
        tenantName: activeRole?.tenantName || 'Global',
        tenantSlug: activeRole?.tenantSlug || 'global',
        roleSlug,
        permissions,
        branchId: activeRole?.branchId,
      },
      roles: user.roles || [],
      modules,
    };
  }

  async getTenant(tenantId: string) {
    return this.authRepository.findTenantById(tenantId);
  }

  async updateTenant(tenantId: string, data: any) {
    return this.authRepository.updateTenant(tenantId, data);
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; password?: string; avatarUrl?: string }) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const updateData: any = {
      firstName: data.firstName || user.firstName,
      lastName: data.lastName || user.lastName,
      avatarUrl: data.avatarUrl || user.avatarUrl,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.authRepository.updateUser(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundException('Error al actualizar el perfil');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }
}

