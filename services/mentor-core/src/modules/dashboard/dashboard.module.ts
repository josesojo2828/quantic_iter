import { Module } from '@nestjs/common';
import { DashboardService } from './application/dashboard.service';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
