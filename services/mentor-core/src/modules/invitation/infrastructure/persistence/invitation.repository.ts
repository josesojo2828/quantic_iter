import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';
import { BaseRepository, QueryScope } from '../../../../common/persistence/base.repository';
import { Invitation } from '../../domain/invitation.entity';

@Injectable()
export class InvitationRepository extends BaseRepository<Invitation> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Partial<Invitation>): Promise<Invitation> {
    return this.prisma.invitation.create({
      data: {
        tenantId: data.tenantId!,
        coachId: data.coachId!,
        token: data.token!,
        type: data.type || 'PROGRAM',
        programId: data.programId,
        groupId: data.groupId,
        maxUses: data.maxUses || 0,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    }) as unknown as Invitation;
  }

  async findByToken(token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { token },
    }) as unknown as Invitation;
  }

  async incrementUses(id: string): Promise<void> {
    await this.prisma.invitation.update({
      where: { id },
      data: { uses: { increment: 1 } },
    });
  }

  async findAll(scope: QueryScope): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({
      where: this.applyScope({}, scope),
      orderBy: { createdAt: 'desc' },
    }) as unknown as Invitation[];
  }
}
