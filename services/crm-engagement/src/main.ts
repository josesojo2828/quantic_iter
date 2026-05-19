import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKERS || 'localhost:9092';
  
  // Create a combined app (REST + Kafka)
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'crm-service',
        brokers: [broker],
        allowAutoTopicCreation: true,
      },
      consumer: {
        groupId: 'crm-consumer-group',
        allowAutoTopicCreation: true,
      },
    },
  });

  app.use(cookieParser());

  await app.startAllMicroservices();
  await app.listen(process.env.CRM_PORT || 3003);
  
  console.log(`🚀 CRM Microservice is running on: ${await app.getUrl()}`);
  console.log('📡 CRM Kafka Consumer is listening');
}
bootstrap();
