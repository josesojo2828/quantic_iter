import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AdminService } from './application/admin.service';
import { AdminController } from './infrastructure/api/admin.controller';
import { PrismaTenantRepository } from './infrastructure/persistence/prisma-tenant.repository';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'auth-tenant-admin',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'audit-consumer-admin',
          },
        },
      },
    ]),
    AuthModule,
    SubscriptionModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    {
      provide: 'ITenantRepository',
      useClass: PrismaTenantRepository,
    },
  ],
  exports: [AdminService],
})
export class AdminModule {}
