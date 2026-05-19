import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Fórmula: XP_necesario = 100 * (nivel ^ 1.5)
  calculateLevel(totalXp: number): number {
    let level = 1;
    while (totalXp >= 100 * Math.pow(level + 1, 1.5)) {
      level++;
    }
    return level;
  }

  async awardXp(userId: string, tenantId: string, amount: number, type: string, metadata?: any) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Registrar la transacción
      await tx.xpTransaction.create({
        data: {
          userId,
          amount,
          type,
          reason: metadata ? JSON.stringify(metadata) : undefined,
          tenantId,
        },
      });

      // 2. Obtener o crear profile del mentee
      const profile = await tx.menteeProfile.upsert({
        where: { userId },
        update: {
          totalXp: { increment: amount },
          lastActivityAt: new Date(),
        },
        create: {
          userId,
          tenantId,
          totalXp: amount,
          level: 1,
        },
      });

      // 3. Recalcular nivel
      const newTotalXp = profile.totalXp + (profile.id ? 0 : amount);
      const newLevel = this.calculateLevel(newTotalXp);
      
      if (newLevel > profile.level) {
        await tx.menteeProfile.update({
          where: { userId },
          data: { level: newLevel },
        });
      }

      return { xpAdded: amount, newTotalXp, level: newLevel };
    });
  }

  async updateStreak(userId: string) {
    const profile = await this.prisma.menteeProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const now = new Date();
    const lastActivity = new Date(profile.lastActivityAt);

    // Normalizar a fechas (sin horas) para comparar días
    const diffInDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      // Actividad consecutiva (Ayer) -> Incrementar racha
      const newStreak = profile.currentStreak + 1;
      await this.prisma.menteeProfile.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          highestStreak: Math.max(newStreak, profile.highestStreak),
          lastActivityAt: now,
        },
      });
    } else if (diffInDays > 1) {
      // Perdió la racha -> Resetear a 1
      await this.prisma.menteeProfile.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityAt: now,
        },
      });
    }
  }

  async ensureProfile(userId: string, tenantId: string) {
    return this.prisma.menteeProfile.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        tenantId,
        totalXp: 0,
        level: 1,
      },
    });
  }
}

