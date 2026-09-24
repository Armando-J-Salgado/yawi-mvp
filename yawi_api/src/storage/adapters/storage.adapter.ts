import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';

export abstract class StorageAdapter {
  abstract upload(file: UploadFileDTO): Promise<UploadFileResult>;
  abstract delete(path: string): Promise<void>;
}
