import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  IStaffRepository,
  StaffQuery,
  CreateStaffDto,
  UpdateStaffDto,
} from '../../domain/staff.repository';
import { StaffMember } from '../../domain/staff-member.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaStaffRepository implements IStaffRepository {
  constructor(private prisma: PrismaService) { }

  async findAll(
    tenantId: string,
    query: StaffQuery,
  ): Promise<{ items: StaffMember[]; total: number }> {
    const { skip, take, orderBy, search, role, excludeRole, excludeUserId } = query;
    const where: Prisma.UserWhereInput = {
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      userRoles: {
        some: { 
          tenantId,
          ...(query.branchId ? { branchId: query.branchId } : {}),
          ...(role ? { role: { slug: role } } : {}),
          ...(excludeRole ? { role: { slug: { not: excludeRole } } } : {})
        }
      },
      OR: [
        { deletedAt: null },
        { deletedAt: { isSet: false } }
      ]
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: skip ? +skip : 0,
        take: take ? +take : 10,
        orderBy: orderBy ? { [orderBy]: 'asc' } : { createdAt: 'desc' },
        include: { 
          userRoles: {
            where: { tenantId },
            include: { role: true }
          }
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(
        (i: any) => {
          const userRole = i.userRoles?.[0];
          if (!userRole) {
            console.warn(`User ${i.id} has no roles for tenant ${tenantId}`);
          }
          return new StaffMember(
            i.id,
            i.firstName,
            i.lastName,
            i.email,
            userRole?.role?.slug || 'unknown',
            userRole?.tenantId || tenantId,
            i.createdAt,
            i.deletedAt,
            userRole?.role || null,
            userRole?.branchId || null,
            i.avatarUrl,
          );
        }
      ),
      total,
    };
  }

  async findById(
    id: string,
    tenantId: string,
    branchId?: string,
  ): Promise<StaffMember | null> {
    const i = await this.prisma.user.findFirst({
      where: { 
        id, 
        userRoles: { 
          some: { 
            tenantId,
            ...(branchId ? { branchId } : {})
          } 
        },
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      },
      include: { 
        userRoles: {
          where: { tenantId },
          include: { role: true }
        }
      },
    });
    if (!i) return null;
    const userRole = i.userRoles?.[0];
    if (!userRole) return null;

    return new StaffMember(
      i.id,
      i.firstName,
      i.lastName,
      i.email,
      userRole.role?.slug || 'unknown',
      userRole.tenantId || tenantId,
      i.createdAt,
      i.deletedAt ?? null,
      userRole.role,
      userRole.branchId,
      i.avatarUrl,
    );
  }

  async create(data: CreateStaffDto): Promise<StaffMember> {
    const role = await this.prisma.role.findUnique({
      where: { slug: data.roleSlug },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: data.tenantId }
    });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          lastTenantId: data.tenantId,
          avatarUrl: data.avatarUrl,
        } as any,
      });

      const userRole = await (tx as any).userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          tenantId: data.tenantId,
          branchId: data.branchId || null,
        },
        include: { role: true }
      });

      return new StaffMember(
        user.id,
        user.firstName,
        user.lastName,
        user.email,
        userRole.role.slug,
        userRole.tenantId!,
        user.createdAt,
        null,
        userRole.role,
        userRole.branchId,
        user.avatarUrl,
      );
    });
  }

  async update(
    id: string,
    data: UpdateStaffDto,
  ): Promise<StaffMember> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: true }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          avatarUrl: data.avatarUrl,
        } as any,
      });

      if (data.roleSlug || data.branchId) {
        // Find existing role for this tenant
        // For simplicity, we assume one role per tenant in this context
        const existingRole = user.userRoles.find(ur => ur.tenantId === (user as any).lastTenantId);
        
        let roleId = existingRole?.roleId;
        if (data.roleSlug) {
          const role = await tx.role.findUnique({ where: { slug: data.roleSlug } });
          if (role) roleId = role.id;
        }

        if (existingRole) {
          await (tx as any).userRole.update({
            where: { id: existingRole.id },
            data: {
              roleId,
              branchId: data.branchId === '' ? null : (data.branchId ?? existingRole.branchId),
            }
          });
        }
      }

      const updatedUser = await tx.user.findUnique({
        where: { id },
        include: {
          userRoles: {
            where: { tenantId: (user as any).lastTenantId },
            include: { role: true }
          }
        }
      });

      if (!updatedUser || updatedUser.userRoles.length === 0) throw new Error('Error al actualizar');
      
      const userRole = updatedUser.userRoles[0];
      return new StaffMember(
        updatedUser.id,
        updatedUser.firstName,
        updatedUser.lastName,
        updatedUser.email,
        userRole.role.slug,
        userRole.tenantId!,
        updatedUser.createdAt,
        updatedUser.deletedAt ?? null,
        userRole.role,
        userRole.branchId,
        updatedUser.avatarUrl,
      );
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
