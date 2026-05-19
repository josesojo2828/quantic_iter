import { Module } from '@nestjs/common';
import { MeasurementService } from './application/measurement.service';
import { MeasurementAnalyticsService } from './application/measurement-analytics.service';
import { MeasurementRepository } from './infrastructure/persistence/measurement.repository';
import { MeasurementController } from './infrastructure/controllers/measurement.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [MeasurementController],
  providers: [MeasurementService, MeasurementAnalyticsService, MeasurementRepository, PrismaService],
  exports: [MeasurementService, MeasurementAnalyticsService],
})
export class MeasurementModule {}
