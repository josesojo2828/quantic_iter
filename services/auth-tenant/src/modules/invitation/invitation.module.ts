import { Module } from '@nestjs/common';
import { InvitationService } from './application/invitation.service';
import { InvitationController } from './infrastructure/controllers/invitation.controller';
import { PrismaInvitationRepository } from './infrastructure/persistence/prisma-invitation.repository';

@Module({
  controllers: [InvitationController],
  providers: [
    InvitationService,
    {
      provide: 'IInvitationRepository',
      useClass: PrismaInvitationRepository,
    },
  ],
  exports: [InvitationService],
})
export class InvitationModule {}
