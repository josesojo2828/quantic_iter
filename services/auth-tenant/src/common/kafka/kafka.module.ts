import { Module, Global } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';

@Global()
@Module({
  providers: [
    {
      provide: 'IEventBus',
      useClass: KafkaProducerService,
    },
  ],
  exports: ['IEventBus'],
})
export class InternalEventBusModule {}
