import { Module } from '@nestjs/common';
import { GroupsController } from './infrastructure/controllers/groups.controller';
import { GroupsService } from './application/groups.service';
import { GroupsRepository } from './infrastructure/persistence/groups.repository';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

@Module({
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository, PrismaService],
  exports: [GroupsService],
})
export class GroupsModule {}
