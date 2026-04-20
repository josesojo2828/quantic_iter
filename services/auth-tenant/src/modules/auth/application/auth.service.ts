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
import { SubscriptionService } from './subscription.service';
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
      });

      // 1.5 Auto-subscribe to the basic plan (Trial/Free tier)
      try {
        await this.subscriptionService.subscribeToPlan(user.tenantId, 'basico');
      } catch (subError) {
        console.error('Failed to auto-subscribe tenant to basic plan:', subError);
        // We don't fail the whole registration if subscription fails, 
        // but it should work if seed is correct.
      }

      this.auditClient.emit('audit.log', {

        userId: user.id,
        tenantId: user.tenantId,
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

    const permissions = user.role.permissions.map((p) => p.action);
    let subStatus = null;
    try {
      subStatus = user.tenantId ? await this.subscriptionService.getSubscriptionStatus(user.tenantId) : null;
    } catch (e) {
      // Default to null if no sub found
    }
    const planFeatures = (subStatus?.plan?.config as any)?.features || [];


    const modules = this.sidebarService.getModulesForUser(user.role.slug, permissions, planFeatures);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.slug,
      tenantId: user.tenantId,
      permissions,
    };

    const token = this.jwtService.sign(payload);

    this.auditClient.emit('audit.log', {
      userId: user.id,
      tenantId: user.tenantId,
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
        role: user.role.slug,
        permissions,
        modules,
      },
    };

  }

  async inviteWorker(ownerTenantId: string, dto: any) {
    // 1. Validate subscription and user limits
    await this.subscriptionService.checkUserLimit(ownerTenantId);

    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) throw new BadRequestException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const role = await this.authRepository.findRoleBySlug(dto.roleSlug);

    if (!role) {
      throw new NotFoundException(`Rol "${dto.roleSlug}" no encontrado.`);
    }

    const user = await this.authRepository.createUser({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      tenantId: ownerTenantId,
      roleId: role.id,
    });

    this.auditClient.emit('audit.log', {
      userId: user.id,
      tenantId: user.tenantId,
      action: AuditAction.REGISTER,
      module: 'auth',
      payload: { email: user.email, role: dto.roleSlug, invitedBy: ownerTenantId },
      timestamp: new Date(),
    });

    return user;
  }

  async getWorkers(tenantId: string) {
    return this.authRepository.findWorkers(tenantId);
  }

  async getProfileWithModules(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const permissions = user.role.permissions.map((p) => p.action);
    let subStatus = null;
    try {
      subStatus = user.tenantId ? await this.subscriptionService.getSubscriptionStatus(user.tenantId) : null;
    } catch (e) {
      // If subscription doesn't exist yet, we continue with empty features
    }
    const planFeatures = (subStatus?.plan?.config as any)?.features || [];


    const modules = this.sidebarService.getModulesForUser(user.role.slug, permissions, planFeatures);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.slug,
      permissions,
      modules,
      tenantId: user.tenantId,
    };
  }

  async getTenant(tenantId: string) {

    return this.authRepository.findTenantById(tenantId);
  }

  async updateTenant(tenantId: string, data: any) {
    return this.authRepository.updateTenant(tenantId, data);
  }
}

