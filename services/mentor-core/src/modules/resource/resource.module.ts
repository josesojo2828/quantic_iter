import { Module } from '@nestjs/common';
import { ResourceController } from './infrastructure/controllers/resource.controller';
import { ResourceService } from './application/resource.service';
import { ResourceRepository } from './infrastructure/persistence/resource.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { ProgramModule } from '../program/program.module';

@Module({
  imports: [ProgramModule],
  controllers: [ResourceController],
  providers: [ResourceService, ResourceRepository, PrismaService],
  exports: [ResourceService],
})
export class ResourceModule {}
