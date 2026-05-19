import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { IBranchRepository, BranchQuery, CreateBranchDto, UpdateBranchDto } from '../../domain/branch.repository';
import { Branch } from '../../domain/branch.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaBranchRepository implements IBranchRepository {
  constructor(private prisma: PrismaService) {}

  private mapToEntity(b: any): Branch {
    return new Branch(
      b.id,
      b.name,
      b.tenantId,
      b.address,
      b.phone,
      b.createdAt,
      b.updatedAt,
      b.deletedAt,
    );
  }

  async findAll(tenantId: string, query: BranchQuery): Promise<{ items: Branch[]; total: number }> {
    const { skip, take, orderBy, search } = query;
    const where: Prisma.BranchWhereInput = {
      tenantId,
      OR: [
        { deletedAt: null },
        { deletedAt: { isSet: false } }
      ]
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip: skip ? +skip : 0,
        take: take ? +take : 10,
        orderBy: orderBy ? { [orderBy]: 'asc' } : { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      items: items.map(b => this.mapToEntity(b)),
      total,
    };
  }

  async findById(id: string, tenantId: string): Promise<Branch | null> {
    const b = await this.prisma.branch.findFirst({
      where: { 
        id, 
        tenantId,
        OR: [
          { deletedAt: null },
          { deletedAt: { isSet: false } }
        ]
      },
    });
    return b ? this.mapToEntity(b) : null;
  }

  async create(tenantId: string, data: CreateBranchDto): Promise<Branch> {
    const b = await this.prisma.branch.create({
      data: {
        ...data,
        tenantId,
      } as any,
    });
    return this.mapToEntity(b);
  }

  async update(id: string, tenantId: string, data: UpdateBranchDto): Promise<Branch> {
    const b = await this.prisma.branch.update({
      where: { id },
      data: data as any,
    });
    return this.mapToEntity(b);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countStaff(id: string, tenantId: string): Promise<number> {
    return this.prisma.userRole.count({
      where: {
        branchId: id,
        tenantId,
      }
    });
  }
}
