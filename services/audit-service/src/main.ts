import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKERS || 'localhost:9092';
  
  // Create a combined app (REST + Kafka)
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'audit-service',
        brokers: [broker],
        allowAutoTopicCreation: true,
        retry: {
          initialRetryTime: 1000,
          retries: 15,
        },
      },
      consumer: {
        groupId: 'audit-consumer-group-v3',
        allowAutoTopicCreation: true,
      },
    },
  });

  await app.startAllMicroservices();
  const port = process.env.PORT || 3005;
  await app.listen(port);
  
  console.log(`🚀 Audit REST API is running on: http://localhost:${port}`);
  console.log('📡 Audit Kafka Consumer is listening');
}
bootstrap();
