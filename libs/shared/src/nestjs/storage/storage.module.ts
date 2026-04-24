import { Module, Global } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: 'IStorageService',
      useClass: S3StorageService,
    },
  ],
  exports: ['IStorageService'],
})
export class StorageModule {}
