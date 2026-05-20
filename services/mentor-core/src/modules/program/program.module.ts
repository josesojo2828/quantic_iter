import { Module } from '@nestjs/common';
import { ProgramController } from './infrastructure/controllers/program.controller';
import { ProgramService } from './application/program.service';
import { ProgramRepository } from './infrastructure/persistence/program.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { ObjectiveModule } from '../objective/objective.module';

@Module({
  imports: [ObjectiveModule],
  controllers: [ProgramController],
  providers: [ProgramService, ProgramRepository, PrismaService],
  exports: [ProgramService],
})
export class ProgramModule {}
