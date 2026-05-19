import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AgendaModule } from './modules/agenda/agenda.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ConfigModule } from '@nestjs/config';
import { ContactsModule } from './modules/contacts/contacts.module';
import { InternalEventBusModule } from './common/kafka/kafka.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { AuthMiddleware } from './common/middleware/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ContactsModule,
    AgendaModule,
    ReviewsModule,
    InternalEventBusModule,
    InteractionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
