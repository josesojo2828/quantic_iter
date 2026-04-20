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
    const { skip, take, orderBy, search } = query;
    const where: Prisma.UserWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: skip ? +skip : 0,
        take: take ? +take : 10,
        orderBy: orderBy ? { [orderBy]: 'asc' } : { createdAt: 'desc' },
        include: { role: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(
        (i) =>
          new StaffMember(
            i.id,
            i.firstName,
            i.lastName,
            i.email,
            i.role.slug,
            i.tenantId!,
            i.createdAt,
            i.deletedAt,
            i.role,
          ),
      ),
      total,
    };
  }

  async findById(
    id: string,
    tenantId: string,
  ): Promise<StaffMember | null> {
    const i = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { role: true },
    });
    if (!i) return null;
    return new StaffMember(
      i.id,
      i.firstName,
      i.lastName,
      i.email,
      i.role.slug,
      i.tenantId!,
      i.createdAt,
      i.deletedAt,
      i.role,
    );
  }

  async create(data: CreateStaffDto): Promise<StaffMember> {
    const role = await this.prisma.role.findUnique({
      where: { slug: data.roleSlug },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');

    const i = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password!,
        firstName: data.firstName,
        lastName: data.lastName,
        tenantId: data.tenantId,
        roleId: role.id,
      },
      include: { role: true },
    });

    return new StaffMember(
      i.id,
      i.firstName,
      i.lastName,
      i.email,
      i.role.slug,
      i.tenantId!,
      i.createdAt,
      i.deletedAt,
      i.role,
    );
  }

  async update(
    id: string,
    data: UpdateStaffDto,
  ): Promise<StaffMember> {
    const updateData: Prisma.UserUpdateInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    };

    if (data.roleSlug) {
      const role = await this.prisma.role.findUnique({
        where: { slug: data.roleSlug },
      });
      if (role) {
        updateData.role = { connect: { id: role.id } };
      }
    }

    const i = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    return new StaffMember(
      i.id,
      i.firstName,
      i.lastName,
      i.email,
      i.role.slug,
      i.tenantId!,
      i.createdAt,
      i.deletedAt,
      i.role,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
