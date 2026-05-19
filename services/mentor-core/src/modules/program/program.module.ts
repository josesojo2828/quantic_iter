import { Module } from '@nestjs/common';
import { ProgramController } from './infrastructure/controllers/program.controller';
import { ProgramService } from './application/program.service';
import { ProgramRepository } from './infrastructure/persistence/program.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService, ProgramRepository, PrismaService],
  exports: [ProgramService],
})
export class ProgramModule {}
