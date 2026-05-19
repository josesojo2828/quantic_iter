import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from '../../domain/storage-provider.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly baseDir = path.join(process.cwd(), 'storage');

  constructor() {
    this.ensureDirExists();
  }

  private async ensureDirExists() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create storage directory', error);
    }
  }

  async save(fileName: string, content: Buffer): Promise<string> {
    const filePath = path.join(this.baseDir, fileName);
    await fs.writeFile(filePath, content);
    this.logger.log(`File saved: ${filePath}`);
    return fileName; // We return the relative path/filename
  }

  async get(fileName: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, fileName);
    return fs.readFile(filePath);
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.baseDir, fileName);
    await fs.unlink(filePath);
  }
}
