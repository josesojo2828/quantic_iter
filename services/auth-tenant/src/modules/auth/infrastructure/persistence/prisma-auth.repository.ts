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
        role: {
          include: {
            permissions: true,
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
      tenantId: user.tenantId,
      createdAt: (user as any).createdAt,
      deletedAt: user.deletedAt,
      role: {
        slug: user.role.slug,
        permissions: user.role.permissions.map((p) => ({ action: p.action })),
      },
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
        role: {
          include: {
            permissions: true,
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
      tenantId: user.tenantId,
      createdAt: (user as any).createdAt,
      deletedAt: user.deletedAt,
      role: {
        slug: user.role.slug,
        permissions: user.role.permissions.map((p) => ({ action: p.action })),
      },
    };
  }


  async createTenantAndOwner(data: RegisterData): Promise<User> {

    const {
      email,
      password,
      firstName,
      lastName,
      workshopName,
      planId,
      roleId,
    } = data;

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const slug = workshopName
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');

      const tenant = await tx.tenant.create({
        data: {
          name: workshopName,
          slug,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password,
          firstName,
          lastName,
          tenantId: tenant.id,
          roleId: roleId!,
        },
      });

      await tx.tenant.update({
        where: { id: tenant.id },
        data: { ownerId: user.id },
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
        user.tenantId!,
        'workshop_owner',
        [],
      );
    });
  }

  async createUser(data: CreateUserData): Promise<User> {
    const { email, password, firstName, lastName, tenantId, roleId } = data;

    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        firstName,
        lastName,
        tenantId,
        roleId,
      },
      include: {
        role: true,
      },
    });

    return new User(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.tenantId!,
      user.role.slug,
      [],
    );
  }

  async findWorkers(
    tenantId: string,
    filters: { search?: string; page?: number; limit?: number },
  ): Promise<{ workers: UserData[]; total: number }> {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      tenantId,
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
          role: {
            include: {
              permissions: true,
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
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt,
        role: {
          slug: user.role.slug,
          permissions: user.role.permissions.map((p) => ({ action: p.action })),
        },
      })),
      total,
    };
  }

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<UserData | null> {
    console.log('--- DB: UPDATING USER ---', { id, data });
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        roleId: data.roleId,
        email: data.email,
      },

      include: {
        role: {
          include: {
            permissions: true,
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
      tenantId: user.tenantId,
      createdAt: (user as any).createdAt,
      deletedAt: user.deletedAt,
      role: {
        slug: user.role.slug,
        permissions: user.role.permissions.map((p) => ({ action: p.action })),
      },
    };
  }

  async deleteUser(id: string): Promise<void> {
    console.log('--- DB: DELETING USER (Logic) ---', { id });
    try {
      await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      console.log('--- DB: USER DELETED SUCCESSFULLY ---', { id });
    } catch (error) {
      console.error('--- DB: ERROR DELETING USER ---', error);
      throw error;
    }
  }




  async findRoleBySlug(slug: string): Promise<RoleData | null> {
    const role = await this.prisma.role.findUnique({ where: { slug } });
    if (!role) return null;
    return {
      id: role.id,
      slug: role.slug,
    };
  }

  async findTenantById(id: string): Promise<any> {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  async updateTenant(id: string, data: any): Promise<any> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}

