import { Module } from '@nestjs/common';
import { SessionService } from './application/session.service';
import { QrTokenService } from './application/qr-token.service';
import { SessionRepository } from './infrastructure/persistence/session.repository';
import { SessionController } from './infrastructure/controllers/session.controller';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';
import { GamificationModule } from '../gamification/gamification.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [GamificationModule, ProgressModule],
  controllers: [SessionController],
  providers: [SessionService, QrTokenService, SessionRepository, PrismaService],
  exports: [SessionService],
})
export class SessionModule {}
