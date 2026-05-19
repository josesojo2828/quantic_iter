import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationsBootstrap');
  
  // Create HTTP App for the Inbox API
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api'); // Removed for consistency with other services
  
  /*
  // Connect Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'notifications-consumer',
        allowAutoTopicCreation: true,
      },
      subscribe: {
        fromBeginning: true,
      }
    },
  });

  await app.startAllMicroservices();
  */
  const port = 3000;
  await app.listen(port);
  
  logger.log(`ANTIGRAVITY_DEBUG: Notification Service is running on port ${port}`);
}
bootstrap();
