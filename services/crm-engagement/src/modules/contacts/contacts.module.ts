import { Module } from '@nestjs/common';
import { ContactsService } from './application/contacts.service';
import { ContactsController } from './infrastructure/controllers/contacts.controller';
import { PrismaContactsRepository } from './infrastructure/persistence/prisma-contacts.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ContactsController],
  providers: [
    ContactsService,
    PrismaService,
    {
      provide: 'IContactsRepository',
      useClass: PrismaContactsRepository,
    },
  ],
  exports: [ContactsService],
})
export class ContactsModule {}
