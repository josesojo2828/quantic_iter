export interface IStorageProvider {
  save(fileName: string, content: Buffer): Promise<string>;
  get(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}
