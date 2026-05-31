import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InvitationRepository } from '../infrastructure/persistence/invitation.repository';
import { Invitation } from '../domain/invitation.entity';
import { QueryScope } from '../../../common/persistence/base.repository';
import { ProgramService } from '../../program/application/program.service';
import { GroupsService } from '../../groups/application/groups.service';
import { GamificationService } from '../../gamification/application/gamification.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitationService {
  constructor(
    private readonly repository: InvitationRepository,
    private readonly programService: ProgramService,
    private readonly groupsService: GroupsService,
    private readonly gamificationService: GamificationService,
  ) {}

  async createInvitation(data: Partial<Invitation>, scope: QueryScope): Promise<Invitation> {
    const token = crypto.randomBytes(6).toString('hex').toUpperCase();
    return this.repository.create({
      ...data,
      token,
      tenantId: data.tenantId || scope.tenantId!,
      coachId: scope.userId,
    });
  }

  async validateToken(token: string): Promise<Invitation> {
    const invitation = await this.repository.findByToken(token);
    if (!invitation) throw new NotFoundException('Invitación no válida');
    if (!invitation.isActive) throw new BadRequestException('Invitación desactivada');
    
    if (invitation.maxUses && invitation.maxUses > 0 && invitation.uses >= invitation.maxUses) {
      throw new BadRequestException('Límite de usos alcanzado');
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitación expirada');
    }

    return invitation;
  }

  async acceptInvitation(token: string, menteeId: string): Promise<any> {
    const invitation = await this.validateToken(token);
    const scope: QueryScope = { 
      tenantId: invitation.tenantId, 
      userId: invitation.coachId,
      coachId: invitation.coachId,
      role: 'mentor_owner' // El proceso de auto-onboarding actúa con permisos de mentor
    };

    // 1. Asegurar Perfil (para que aparezca en el dashboard del owner)
    await this.gamificationService.ensureProfile(menteeId, invitation.tenantId);

    // 2. Ejecutar vinculación según tipo
    if (invitation.type === 'PROGRAM' && invitation.programId) {
      await this.programService.enrollMentee(invitation.programId, menteeId, scope);
    } else if (invitation.type === 'GROUP' && invitation.groupId) {
      await this.groupsService.addMember(invitation.groupId, menteeId, scope);
    }

    await this.repository.incrementUses(invitation.id);
    return { 
      success: true, 
      message: 'Invitación aceptada correctamente',
      type: invitation.type,
      tenantId: invitation.tenantId
    };
  }

  async listInvitations(scope: QueryScope): Promise<Invitation[]> {
    return this.repository.findAll(scope);
  }
}
