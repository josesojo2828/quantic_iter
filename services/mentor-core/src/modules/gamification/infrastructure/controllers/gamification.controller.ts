import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from '../../application/gamification.service';
import { LocalAuthGuard } from '../../../../common/guards/auth.guard';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { PrismaService } from '../../../../infrastructure/persistence/prisma.service';

@Controller('gamification')
@UseGuards(LocalAuthGuard, ScopeGuard)
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService
  ) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.scope?.userId || req.user.sub || req.user.userId;
    const stats = await this.prisma.menteeProfile.findUnique({
      where: { userId }
    });
    
    return stats || { userId, xp: 0, level: 1, currentStreak: 0 };
  }
}

