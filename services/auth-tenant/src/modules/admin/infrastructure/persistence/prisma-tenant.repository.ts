import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ITenantRepository, TenantData } from '../../domain/tenant.repository';

@Injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { search?: string; page?: number; limit?: number }): Promise<{ items: TenantData[]; total: number }> {
    const { search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: {
            where: {
              role: {
                slug: 'mentor_owner',
              },
            },
            take: 1,
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      items: items.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        createdAt: t.createdAt,
        active: true,
        logo: t.logo ?? undefined,
        owner: t.userRoles[0]?.user ?? undefined,
      })),
      total,
    };
  }

  async findById(id: string): Promise<TenantData | null> {
    const t = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
              },
            },
            role: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        branches: {
          select: {
            id: true,
            name: true,
            address: true,
            createdAt: true,
          }
        },
        subscription: {
          include: {
            plan: true
          }
        }
      },
    });

    if (!t) return null;

    const users = t.userRoles.map(ur => ({
      ...ur.user,
      role: ur.role,
    }));

    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt,
      active: (t as any).isActive,
      logo: t.logo ?? undefined,
      owner: users.find(u => u.role.slug === 'mentor_owner'),
      users,
      branches: t.branches,
      subscription: t.subscription
    };
  }

  async findOwnerByTenantId(tenantId: string): Promise<any> {
    const userRole = await (this.prisma as any).userRole.findFirst({
      where: {
        tenantId,
        role: {
          slug: 'mentor_owner',
        },
      },
      include: {
        user: true,
        role: {
          include: {
            permissions: true,
          },
        },
        tenant: true,
      },
    });

    if (!userRole) return null;

    // Map to a format usable by AdminService, similar to UserData
    return {
      id: userRole.user.id,
      email: userRole.user.email,
      firstName: userRole.user.firstName,
      lastName: userRole.user.lastName,
      lastTenantId: userRole.user.lastTenantId,
      roles: [{
        tenantId: userRole.tenantId,
        tenantName: userRole.tenant.name,
        tenantSlug: userRole.tenant.slug,
        roleSlug: userRole.role.slug,
        branchId: userRole.branchId,
        permissions: userRole.role.permissions.map((p: any) => p.action),
      }],
    };
  }
}
