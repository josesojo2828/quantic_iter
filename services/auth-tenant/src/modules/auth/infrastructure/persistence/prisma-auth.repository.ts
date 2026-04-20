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
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) return null;

    // Direct mapping to UserData interface
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      deletedAt: user.deletedAt,
      role: {
        slug: user.role.slug,
        permissions: user.role.permissions.map((p) => ({ action: p.action })),
      },
    };
  }

  async findById(id: string): Promise<UserData | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

  async findWorkers(tenantId: string): Promise<UserData[]> {
    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: {
          slug: {
            in: ['mechanic', 'receptionist'],
          },
        },
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      tenantId: user.tenantId,
      deletedAt: user.deletedAt,
      role: {
        slug: user.role.slug,
        permissions: user.role.permissions.map((p) => ({ action: p.action })),
      },
    }));
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

