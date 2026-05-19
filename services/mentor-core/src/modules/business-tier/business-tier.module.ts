import { Module } from '@nestjs/common';
import { BusinessTierController } from './infrastructure/controllers/business-tier.controller';
import { BusinessTierService } from './application/business-tier.service';
import { BusinessTierRepository } from './infrastructure/persistence/business-tier.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  imports: [],
  controllers: [BusinessTierController],
  providers: [BusinessTierService, BusinessTierRepository, PrismaService],
  exports: [BusinessTierService],
})
export class BusinessTierModule {}
