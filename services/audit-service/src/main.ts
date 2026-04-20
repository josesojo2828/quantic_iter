import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKERS || 'localhost:9092';
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'audit-service',
        brokers: [broker],
      },
      consumer: {
        groupId: 'audit-consumer',
      },
    },
  });

  await app.listen();
  console.log('🚀 Audit Microservice is listening via Kafka');
}
bootstrap();
