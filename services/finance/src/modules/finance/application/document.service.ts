import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { IStorageProvider } from '../../storage/domain/storage-provider.interface';
import { DocumentType, DocumentStatus } from '@prisma/client';

export interface CreateDocumentDto {
  type: DocumentType;
  tenantId: string;
  customerId: string;
  subtotal: number;
  taxRate: number; // e.g., 0.21 for 21%
  currency?: string;
  items: any[];
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('IStorageProvider') private readonly storage: IStorageProvider,
  ) {}

  async create(dto: CreateDocumentDto) {
    const taxTotal = Number(dto.subtotal) * dto.taxRate;
    const total = Number(dto.subtotal) + taxTotal;

    // 1. Generate document number (Dummy logic for now)
    const count = await this.prisma.document.count({
      where: { tenantId: dto.tenantId, type: dto.type },
    });
    const number = `${dto.type.substring(0, 3)}-${(count + 1).toString().padStart(6, '0')}`;

    // 2. Persist in DB
    const document = await this.prisma.document.create({
      data: {
        type: dto.type,
        number,
        tenantId: dto.tenantId,
        customerId: dto.customerId,
        subtotal: Number(dto.subtotal),
        taxTotal,
        total,
        currency: dto.currency || 'USD',
        status: DocumentStatus.ISSUED,
        metadata: { items: dto.items },
        issuedAt: new Date(),
      },
    });

    // 3. Generate "File" (Simulated PDF for now)
    const content = Buffer.from(`Document ${number}\nTotal: ${total} ${dto.currency}`);
    const storagePath = await this.storage.save(`${number}.txt`, content);

    // 4. Update storage path
    return this.prisma.document.update({
      where: { id: document.id },
      data: { storagePath },
    });
  }

  async getByTenant(tenantId: string) {
    return this.prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
