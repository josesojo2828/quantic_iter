import { Module } from '@nestjs/common';
import { InvitationService } from './application/invitation.service';
import { InvitationRepository } from './infrastructure/persistence/invitation.repository';
import { InvitationController } from './infrastructure/controllers/invitation.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { ProgramModule } from '../program/program.module';
import { GroupsModule } from '../groups/groups.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [ProgramModule, GroupsModule, GamificationModule],
  controllers: [InvitationController],
  providers: [InvitationService, InvitationRepository, PrismaService],
  exports: [InvitationService],
})
export class InvitationModule {}
