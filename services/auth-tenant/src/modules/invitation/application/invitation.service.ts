import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IInvitationRepository } from '../domain/invitation.repository';
import * as crypto from 'crypto';
import { type IEventBus } from '../../../common/events/event-bus.interface';
import { InvitationAcceptedEvent } from '../domain/events/invitation-accepted.event';
import { SubscriptionService } from '../../subscription/application/subscription.service';
import type { IAuthRepository } from '../../auth/domain/auth.repository';



@Injectable()
export class InvitationService {
  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly subscriptionService: SubscriptionService,
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async createInvitation(dto: {
    email: string;
    roleId?: string;
    roleSlug?: string;
    tenantId: string;
    branchId?: string;
    invitedBy: string;
  }) {
    dto.email = dto.email.trim().toLowerCase();
    // 0. Validate subscription limits
    const subStatus = await this.subscriptionService.getSubscriptionStatus(dto.tenantId);
    const config = subStatus.config;
    const maxUsers = config.maxUsers || 5;

    const currentUserCount = subStatus.usage?.users?.current || 0;
    const pendingInvitationsCount = await this.invitationRepository.countActiveInvitations(dto.tenantId);

    console.log(`[InvitationService] DEBUG LIMIT CHECK:`, {
      tenantId: dto.tenantId,
      maxUsers,
      currentUserCount,
      pendingInvitationsCount,
      sum: currentUserCount + pendingInvitationsCount,
    });

    if (currentUserCount + pendingInvitationsCount >= maxUsers) {
      throw new BadRequestException(
        `Límite de usuarios/entrenadores superado. Cupos actuales: ${currentUserCount} activos, ${pendingInvitationsCount} invitaciones pendientes. Límite máximo del plan: ${maxUsers}.`
      );
    }

    // Resolve role ID from slug if needed
    let resolvedRoleId = dto.roleId;
    if (!resolvedRoleId && dto.roleSlug) {
      const role = await this.authRepository.findRoleBySlug(dto.roleSlug);
      if (!role) {
        throw new BadRequestException(`El rol con slug "${dto.roleSlug}" no existe`);
      }
      resolvedRoleId = role.id;
    }

    if (!resolvedRoleId) {
      throw new BadRequestException('Se requiere proveer el roleId o el roleSlug para la invitación');
    }

    // 1. Check if there is already a pending invitation for this email in this tenant
    const existing = await this.invitationRepository.findByEmailAndTenant(dto.email, dto.tenantId);
    if (existing) {
      throw new BadRequestException('Ya existe una invitación pendiente para este correo en este mentoría');
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // 3. Set expiration (e.g., 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Save to DB
    const invitation = await this.invitationRepository.create({
      email: dto.email,
      token,
      roleId: resolvedRoleId,
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      expiresAt,
    });

    // 5. TODO: Emit event to Notification Service (Micro #5)
    console.log(`[InvitationService] Invitation created for ${dto.email}. Token: ${token}`);
    
    return {
      message: 'Invitación enviada con éxito',
      token: invitation.token, // Removing this in production, only for testing now
    };
  }

  async validateToken(token: string) {
    const invitation = await this.invitationRepository.findByToken(token);
    
    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException('Esta invitación ya fue utilizada');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('La invitación ha expirado');
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId?: string) {
    const invitation = await this.validateToken(token);
    await this.invitationRepository.markAsAccepted(invitation.id);

    if (userId) {
      await this.authRepository.addUserRole(
        userId,
        invitation.roleId,
        invitation.tenantId,
        (invitation as any).branchId || undefined,
      );
    }

    // Emitir evento de auditoría
    await this.eventBus.publish(new InvitationAcceptedEvent(invitation.id, {
      email: invitation.email,
      tenantId: invitation.tenantId,
      roleId: invitation.roleId,
      branchId: (invitation as any).branchId,
      acceptedAt: new Date(),
    }));

    return invitation;
  }

  async getInvitationsByTenant(tenantId: string) {
    return this.invitationRepository.findByTenant(tenantId);
  }

  async cancelInvitation(id: string) {
    await this.invitationRepository.delete(id);
  }

  async getPendingInvitationsForEmail(email: string) {
    const targetEmail = email.trim().toLowerCase();
    console.log('[BACKEND SERVICIO DEBUG] Buscando invitaciones para:', targetEmail);
    const invites = await this.invitationRepository.findByEmail(targetEmail);
    console.log('[BACKEND SERVICIO DEBUG] Invitaciones brutas encontradas en DB:', invites);
    const mapped = [];
    const now = new Date();

    for (const inv of invites) {
      const expires = new Date(inv.expiresAt);
      console.log(`[BACKEND SERVICIO DEBUG] Analizando invitación ID: ${inv.id}. Vence: ${expires}, Ahora: ${now}, Válida: ${expires > now}`);
      if (expires > now) {
        const tenant = await this.authRepository.findTenantById(inv.tenantId.toString());
        console.log(`[BACKEND SERVICIO DEBUG] Tenant de la invitación encontrado:`, tenant);
        mapped.push({
          id: inv.id,
          email: inv.email,
          token: inv.token,
          tenantId: inv.tenantId,
          roleId: inv.roleId,
          expiresAt: inv.expiresAt,
          tenantName: tenant ? tenant.name : 'Gimnasio ITER',
        });
      }
    }
    console.log('[BACKEND SERVICIO DEBUG] Listado de invitaciones mapeado final:', mapped);
    return mapped;
  }
}
