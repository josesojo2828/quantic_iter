import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Branch, BranchData, BranchRepository } from '../../domain/branch.repository';

@Injectable()
export class PrismaBranchRepository implements BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: BranchData): Promise<Branch> {
    const branch = await (this.prisma as any).branch.create({
      data: {
        ...data,
        tenantId,
      },
    });
    return branch as any as Branch;
  }

  async findAll(tenantId: string, branchId?: string): Promise<Branch[]> {
    const branches = await (this.prisma as any).branch.findMany({
      where: {
        tenantId,
        ...(branchId ? { id: branchId } : {}),
        deletedAt: null,
      },
    });
    return branches as any as Branch[];
  }

  async findById(id: string): Promise<Branch | null> {
    const branch = await (this.prisma as any).branch.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
    return branch as any as Branch | null;
  }

  async update(id: string, data: Partial<BranchData>): Promise<Branch> {
    const branch = await (this.prisma as any).branch.update({
      where: { id },
      data,
    });
    return branch as any as Branch;
  }

  async delete(id: string): Promise<void> {
    await (this.prisma as any).branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
