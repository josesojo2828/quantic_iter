import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  IAuthRepository,
  RegisterData,
  UserData,
  RoleData,
  CreateUserData,
} from '../../domain/auth.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private prisma: PrismaService) { }

  async findByEmail(email: string): Promise<UserData | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        email,
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
            tenant: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      lastTenantId: user.lastTenantId ?? null,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt ?? null,
      avatarUrl: user.avatarUrl ?? null,
      roles: user.userRoles.map((ur) => ({
        tenantId: ur.tenantId ?? null,
        tenantName: ur.tenant?.name ?? 'Global',
        tenantSlug: ur.tenant?.slug ?? 'global',
        roleSlug: ur.role.slug,
        branchId: ur.branchId,
        permissions: [...new Set([
          ...ur.role.permissions.map((p) => p.action),
          ...(ur.extraPermissions || []),
        ])],
      })),
    };
  }

  async findById(id: string): Promise<UserData | null> {
    const user = await this.prisma.user.findFirst({
      where: { 
        id,
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
            tenant: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      lastTenantId: user.lastTenantId ?? null,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt ?? null,
      avatarUrl: user.avatarUrl ?? null,
      roles: user.userRoles.map((ur) => ({
        tenantId: ur.tenantId ?? null,
        tenantName: ur.tenant?.name ?? 'Global',
        tenantSlug: ur.tenant?.slug ?? 'global',
        roleSlug: ur.role.slug,
        branchId: ur.branchId,
        permissions: [...new Set([
          ...ur.role.permissions.map((p) => p.action),
          ...(ur.extraPermissions || []),
        ])],
      })),
    };
  }

  async createTenantAndOwner(data: RegisterData): Promise<User> {
    const {
      email,
      password,
      firstName,
      lastName,
      mentorName,
      planId,
      roleId,
    } = data;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const tenantName = mentorName || `${firstName} Academy`;
      const slug = tenantName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '') || 'my-academy';

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug,
        },
      });

      const branch = await (tx as any).branch.create({
        data: {
          name: 'Sede Central',
          address: 'Dirección por completar',
          phone: '000000000',
          tenantId: tenant.id,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password,
          firstName,
          lastName,
          lastTenantId: tenant.id,
          avatarUrl: data.avatarUrl,
        } as any,
      });

      await (tx as any).userRole.create({
        data: {
          userId: user.id,
          roleId: roleId!,
          tenantId: tenant.id,
          branchId: branch.id,
        },
      });

      await tx.tenant.update({
        where: { id: tenant.id },
        data: { mentor_ownerId: user.id },
      });

      if (planId) {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: planId,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      return new User(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        [
          {
            tenantId: tenant.id,
            tenantName: tenant.name,
            tenantSlug: tenant.slug,
            roleSlug: 'mentor_owner',
            branchId: branch.id,
            permissions: [],
          },
        ],
        tenant.id,
        user.avatarUrl,
      );
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    const { email, password, firstName, lastName, tenantId, roleId, branchId } = data;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          password,
          firstName,
          lastName,
          lastTenantId: tenantId,
          avatarUrl: data.avatarUrl,
        } as any,
      });

      await (tx as any).userRole.create({
        data: {
          userId: user.id,
          roleId,
          tenantId,
          branchId,
        },
      });

      const userWithRoles = await tx.user.findUnique({
        where: { id: user.id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
              tenant: true,
            },
          },
        },
      });

      if (!userWithRoles) throw new Error('Error al crear usuario');

      return new User(
        userWithRoles.id,
        userWithRoles.email,
        userWithRoles.firstName,
        userWithRoles.lastName,
        userWithRoles.userRoles.map((ur: any) => ({
          tenantId: ur.tenantId,
          tenantName: ur.tenant.name,
          tenantSlug: ur.tenant.slug,
          roleSlug: ur.role.slug,
          branchId: ur.branchId,
          permissions: [...new Set([
            ...ur.role.permissions.map((p: any) => p.action),
            ...(ur.extraPermissions || []),
          ])],
        })),
        tenantId,
        userWithRoles.avatarUrl,
      );
    });
  }

  async findWorkers(
    tenantId: string,
    filters: { search?: string; page?: number; limit?: number },
  ): Promise<{ workers: UserData[]; total: number }> {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      userRoles: {
        some: { tenantId }
      },
      OR: [
        { deletedAt: null },
        { deletedAt: { isSet: false } }
      ]
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
              tenant: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      workers: users.map((user) => ({
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        lastTenantId: user.lastTenantId ?? null,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt ?? null,
        avatarUrl: user.avatarUrl ?? null,
        roles: user.userRoles.map((ur) => ({
          tenantId: ur.tenantId ?? null,
          tenantName: ur.tenant?.name ?? 'Global',
          tenantSlug: ur.tenant?.slug ?? 'global',
          roleSlug: ur.role.slug,
          branchId: ur.branchId ?? null,
          permissions: [...new Set([
            ...ur.role.permissions.map((p) => p.action),
            ...(ur.extraPermissions || []),
          ])],
        })),
      })),
      total,
    };
  }

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<UserData | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatarUrl: data.avatarUrl,
      } as any,
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
            tenant: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      lastTenantId: user.lastTenantId ?? null,
      createdAt: user.createdAt,
      deletedAt: user.deletedAt ?? null,
      avatarUrl: user.avatarUrl ?? null,
      roles: user.userRoles.map((ur) => ({
        tenantId: ur.tenantId ?? null,
        tenantName: ur.tenant?.name ?? 'Global',
        tenantSlug: ur.tenant?.slug ?? 'global',
        roleSlug: ur.role.slug,
        branchId: ur.branchId,
        permissions: [...new Set([
          ...ur.role.permissions.map((p) => p.action),
          ...(ur.extraPermissions || []),
        ])],
      })),
    };
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() } as any,
    });
  }

  async findRoleBySlug(slug: string): Promise<RoleData | null> {
    const role = await this.prisma.role.findFirst({
      where: { slug },
    });
    if (!role) return null;
    return {
      id: role.id,
      slug: role.slug,
    };
  }

  async findTenantById(id: string): Promise<any> {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        branches: true,
        subscription: true,
        mentor_owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          }
        }
      },
    });
  }

  async updateTenant(id: string, data: any): Promise<any> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async findAllUsers(filters: { search?: string; page?: number; limit?: number; roleId?: string }): Promise<{ items: UserData[]; total: number }> {
    const { search, page = 1, limit = 10, roleId } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      OR: [
        { deletedAt: null },
        { deletedAt: { isSet: false } }
      ]
    };

    if (roleId) {
      where.userRoles = { some: { roleId } };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
              tenant: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => {
        const primaryRole = user.userRoles[0];
        return {
          id: user.id,
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          lastTenantId: user.lastTenantId ?? null,
          createdAt: user.createdAt,
          deletedAt: user.deletedAt ?? null,
          avatarUrl: user.avatarUrl ?? null,
          tenantId: primaryRole?.tenantId || null,
          tenant: primaryRole?.tenant ? {
            id: primaryRole.tenant.id,
            name: primaryRole.tenant.name,
            slug: primaryRole.tenant.slug,
          } : null,
          role: primaryRole?.role ? {
            id: primaryRole.role.id,
            name: primaryRole.role.name,
            slug: primaryRole.role.slug,
          } : { slug: 'super_admin', name: 'Super Admin' },
          roles: user.userRoles.map((ur) => ({
            tenantId: ur.tenantId ?? null,
            tenantName: ur.tenant?.name ?? 'Global',
            tenantSlug: ur.tenant?.slug ?? 'global',
            roleSlug: ur.role.slug,
            branchId: ur.branchId ?? null,
            permissions: [...new Set([
              ...ur.role.permissions.map((p) => p.action),
              ...(ur.extraPermissions || []),
            ])],
          })),
        };
      }),
      total,
    };
  }
}
