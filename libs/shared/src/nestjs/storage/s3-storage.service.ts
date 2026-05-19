import { Injectable, Logger } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService, UploadOptions } from './storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly client: S3Client;
  private readonly logger = new Logger(S3StorageService.name);
  private readonly defaultBucket: string;

  constructor() {
    this.client = new S3Client({
      endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
      region: process.env.STORAGE_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true, // Required for MinIO
    });
    this.defaultBucket = process.env.STORAGE_BUCKET || 'mentor-assets';
  }

  async uploadFile(
    key: string,
    file: Buffer,
    options?: UploadOptions,
  ): Promise<string> {
    const bucket = options?.bucket || this.defaultBucket;
    
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file,
          ContentType: options?.contentType,
          ACL: options?.isPublic ? 'public-read' : 'private',
        }),
      );
      
      this.logger.log(`File uploaded successfully: ${key} to bucket ${bucket}`);
      return key;
    } catch (error) {
      this.logger.error(`Error uploading file ${key}:`, error);
      throw error;
    }
  }

  async getSignedUrl(key: string, bucket?: string): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    const command = new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.client, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(`Error generating signed URL for ${key}:`, error);
      throw error;
    }
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    const targetBucket = bucket || this.defaultBucket;
    
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: targetBucket,
          Key: key,
        }),
      );
      this.logger.log(`File deleted successfully: ${key} from bucket ${targetBucket}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${key}:`, error);
      throw error;
    }
  }
}
