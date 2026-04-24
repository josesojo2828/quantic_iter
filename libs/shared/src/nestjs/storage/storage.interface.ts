export interface UploadOptions {
  bucket?: string;
  contentType?: string;
  isPublic?: boolean;
}

export interface IStorageService {
  uploadFile(
    key: string,
    file: Buffer,
    options?: UploadOptions,
  ): Promise<string>;
  
  getSignedUrl(key: string, bucket?: string): Promise<string>;
  
  deleteFile(key: string, bucket?: string): Promise<void>;
}
