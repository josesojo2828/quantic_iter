import { Module } from '@nestjs/common';
import { ReviewsService } from './application/reviews.service';
import { ReviewsController } from './infrastructure/controllers/reviews.controller';
import { PrismaReviewsRepository } from './infrastructure/persistence/prisma-reviews.repository';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    PrismaService,
    {
      provide: 'IReviewsRepository',
      useClass: PrismaReviewsRepository,
    },
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
