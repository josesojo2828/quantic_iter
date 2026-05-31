import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IInvitationRepository } from '../../domain/invitation.repository';

@Injectable()
export class PrismaInvitationRepository implements IInvitationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    token: string;
    roleId: string;
    tenantId: string;
    branchId?: string;
    expiresAt: Date;
  }) {
    return this.prisma.invitation.create({
      data: {
        email: data.email,
        token: data.token,
        roleId: data.roleId,
        tenantId: data.tenantId,
        branchId: data.branchId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.invitation.findUnique({
      where: { token },
    });
  }

  async findByEmailAndTenant(email: string, tenantId: string) {
    const invites = await this.prisma.invitation.findMany({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
    });
    return invites.find(
      (inv) => inv.tenantId.toString() === tenantId && !inv.acceptedAt,
    ) || null;
  }

  async findByTenant(tenantId: string) {
    const invites = await this.prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return invites.filter((inv) => inv.tenantId.toString() === tenantId);
  }

  async findByEmail(email: string) {
    const invites = await this.prisma.invitation.findMany({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return invites.filter(inv => !inv.acceptedAt);
  }

  async delete(id: string) {
    await this.prisma.invitation.delete({
      where: { id },
    });
  }

  async markAsAccepted(id: string) {
    await this.prisma.invitation.update({
      where: { id },
      data: { acceptedAt: new Date() },
    });
  }

  async countActiveInvitations(tenantId: string): Promise<number> {
    const invites = await this.prisma.invitation.findMany();
    const now = new Date();
    const active = invites.filter(
      (inv) =>
        inv.tenantId.toString() === tenantId &&
        !inv.acceptedAt &&
        new Date(inv.expiresAt) > now,
    );
    return active.length;
  }
}
