import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IStorageProvider } from '../../domain/storage-provider.interface';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioStorageAdapter implements IStorageProvider, OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: Number(this.configService.get<number>('MINIO_PORT', 9000)),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucketName = this.configService.get<string>('MINIO_BUCKET', 'mentor-finance');
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
      }
    } catch (error: any) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`);
    }
  }

  async save(fileName: string, content: Buffer): Promise<string> {
    try {
      await this.minioClient.putObject(this.bucketName, fileName, content);
      this.logger.log(`File "${fileName}" saved to Minio bucket "${this.bucketName}".`);
      return fileName;
    } catch (error: any) {
      this.logger.error(`Error saving file to Minio: ${error.message}`);
      throw error;
    }
  }

  async get(path: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(this.bucketName, path);
      return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', (err) => reject(err));
      });
    } catch (error: any) {
      this.logger.error(`Error getting file from Minio: ${error.message}`);
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, path);
      this.logger.log(`File "${path}" deleted from Minio.`);
    } catch (error: any) {
      this.logger.error(`Error deleting file from Minio: ${error.message}`);
      throw error;
    }
  }
}
