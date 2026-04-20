import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({})
export class KafkaModule {
  static register(clientId: string, groupId: string): DynamicModule {
    const broker = process.env.KAFKA_BROKERS || 'localhost:9092';
    
    return {
      module: KafkaModule,
      imports: [
        ClientsModule.register([
          {
            name: 'AUDIT_SERVICE',
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId,
                brokers: [broker],
              },
              consumer: {
                groupId,
              },
            },
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
