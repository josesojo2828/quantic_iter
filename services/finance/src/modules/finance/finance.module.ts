import { Module } from '@nestjs/common';
import { FinanceController } from './infrastructure/controllers/finance.controller';
import { DocumentService } from './application/document.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [FinanceController],
  providers: [DocumentService, PrismaService],
})
export class FinanceModule {}
