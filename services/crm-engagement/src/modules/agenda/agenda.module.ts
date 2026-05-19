import { Module } from '@nestjs/common';
import { AgendaService } from './application/agenda.service';
import { AgendaController } from './infrastructure/controllers/agenda.controller';
import { PrismaAgendaRepository } from './infrastructure/persistence/prisma-agenda.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AgendaController],
  providers: [
    AgendaService,
    PrismaService,
    {
      provide: 'IAgendaRepository',
      useClass: PrismaAgendaRepository,
    },
  ],
  exports: [AgendaService],
})
export class AgendaModule {}
