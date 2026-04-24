import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { TenantController } from './infrastructure/controllers/tenant.controller';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { AuthService } from './application/auth.service';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';
import { SubscriptionModule } from '../subscription/subscription.module';
import { StaffModule } from '../staff/staff.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtStrategy } from '../../common/auth/strategies/jwt.strategy';
import { SidebarService } from './application/sidebar.service';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
            clientId: 'auth-producer',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'auth-group',
          },
        },
      },
    ]),
    SubscriptionModule,
    StaffModule,
  ],
  controllers: [AuthController, TenantController, DashboardController],
  providers: [
    AuthService,
    SidebarService,
    JwtStrategy,
    {
      provide: 'IAuthRepository',
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [AuthService, SidebarService, 'IAuthRepository', JwtStrategy, PassportModule],
})
export class AuthModule { }
