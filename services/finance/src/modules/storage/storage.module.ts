import { Global, Module } from '@nestjs/common';
import { MinioStorageAdapter } from './infrastructure/providers/minio-storage.adapter';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IStorageProvider',
      useClass: MinioStorageAdapter,
    },
  ],
  exports: ['IStorageProvider'],
})
export class StorageModule {}
