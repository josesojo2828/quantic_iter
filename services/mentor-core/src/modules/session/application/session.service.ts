import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SessionRepository } from '../infrastructure/persistence/session.repository';
import { Session, SessionAttendance } from '../domain/session.entity';
import { QueryScope } from '../../../common/persistence/base.repository';
import { GamificationService } from '../../gamification/application/gamification.service';
import { ProgressService } from '../../progress/application/progress.service';
import { QrTokenService } from './qr-token.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly gamificationService: GamificationService,
    private readonly progressService: ProgressService,
    private readonly qrTokenService: QrTokenService,
  ) {}

  async generateQrToken(menteeId: string, sessionId: string, scope: QueryScope) {
    return this.qrTokenService.generateToken({ menteeId, sessionId, tenantId: scope.tenantId });
  }

  async validateQrCheckin(sessionId: string, token: string, scope: QueryScope): Promise<SessionAttendance> {
    const decoded = this.qrTokenService.verifyToken(token);
    
    if (decoded.sessionId !== sessionId) {
      throw new UnauthorizedException('El token no pertenece a esta sesión');
    }

    if (decoded.tenantId !== scope.tenantId) {
      throw new UnauthorizedException('Token de otra organización');
    }

    return this.recordAttendance(sessionId, decoded.menteeId, 'PRESENT', scope, 'QR');
  }

  async recordAttendance(
    sessionId: string,
    menteeId: string,
    status: string,
    scope: QueryScope,
    method: string = 'MANUAL'
  ): Promise<SessionAttendance> {
    const session = await this.repository.findById(sessionId, scope);
    if (!session) throw new NotFoundException('Sesión no encontrada');

    // Normalizar status
    const finalStatus = status === 'ATTENDED' ? 'PRESENT' : status;
    const attendance = await this.repository.recordAttendance(sessionId, menteeId, finalStatus, method);

    // Otorgar XP si está presente
    if (finalStatus === 'PRESENT') {
      await this.gamificationService.awardXp(menteeId, scope.tenantId, 30, 'SESSION_ATTENDED', `Asistencia a sesión: ${session.title}`);
      
      await this.progressService.logActivity({
        tenantId: scope.tenantId,
        menteeId,
        type: 'SESSION_ATTENDED',
        title: 'Asistencia Confirmada',
        description: `Asististe a la sesión: ${session.title}`,
        metadata: { sessionId, method }
      });
    }

    return attendance;
  }

  async createSession(data: Partial<Session>): Promise<Session> {
    const session = await this.repository.create(data);
    await this.syncWithCrm(session);
    return session;
  }

  async getAllSessions(scope: QueryScope): Promise<Session[]> {
    return this.repository.findAll(scope);
  }

  async getMenteeSessions(menteeId: string, scope: QueryScope): Promise<Session[]> {
    return this.repository.findByMentee(menteeId, scope);
  }

  async updateNotes(id: string, notes: string, isPrivate: boolean, scope: QueryScope) {
    const session = await this.repository.findById(id, scope);
    if (!session) throw new NotFoundException('Sesión no encontrada');
    
    return this.repository.update(id, { notes, isNotesPrivate: isPrivate }, scope);
  }

  async addFeedback(id: string, rating: number, comment: string, scope: QueryScope) {
    const session = await this.repository.findById(id, scope);
    if (!session) throw new NotFoundException('Sesión no encontrada');

    // 1. Validar rango de rating
    if (rating < 1 || rating > 5) {
      throw new UnauthorizedException('El rating debe estar entre 1 y 5 estrellas');
    }

    // 2. Validar que el usuario asistió (PRESENT)
    const attendance = await this.repository.getAttendance(id);
    const userAttendance = attendance.find(a => a.menteeId === scope.userId);
    
    if (!userAttendance || userAttendance.status !== 'PRESENT') {
      throw new UnauthorizedException('Solo los alumnos que asistieron a la sesión pueden dejar feedback');
    }

    // 3. Validar que la sesión ya pasó o está completada
    const now = new Date();
    if (session.status !== 'COMPLETED' && new Date(session.scheduledAt) > now) {
      throw new UnauthorizedException('Solo se puede dejar feedback una vez iniciada o completada la sesión');
    }
    
    return this.repository.update(id, { feedbackRating: rating, feedbackComment: comment }, scope);
  }

  async getSessionAttendance(sessionId: string, scope: QueryScope): Promise<SessionAttendance[]> {
    const session = await this.repository.findById(sessionId, scope);
    if (!session) throw new NotFoundException('Sesión no encontrada');
    return this.repository.getAttendance(sessionId);
  }

  private async syncWithCrm(session: Session) {
    // Simulación de integración con CRM-Engagement
    console.log(`[CRM_SYNC] Sincronizando sesión ${session.id} ("${session.title}") con la agenda del CRM Engagement para el Tenant ${session.tenantId}...`);
  }
}
