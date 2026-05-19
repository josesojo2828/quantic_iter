import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import type { IInvitationRepository } from '../domain/invitation.repository';
import * as crypto from 'crypto';
import { type IEventBus } from '../../../common/events/event-bus.interface';
import { InvitationAcceptedEvent } from '../domain/events/invitation-accepted.event';



@Injectable()
export class InvitationService {
  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async createInvitation(dto: {
    email: string;
    roleId: string;
    tenantId: string;
    branchId?: string;
    invitedBy: string;
  }) {
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
      roleId: dto.roleId,
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

  async acceptInvitation(token: string) {
    const invitation = await this.validateToken(token);
    await this.invitationRepository.markAsAccepted(invitation.id);

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
}
