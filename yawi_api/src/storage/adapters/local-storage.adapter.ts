import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter';
import { LocalStorageService } from '../services/local-storage.service';
import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';

@Injectable()
export class LocalStorageAdapter extends StorageAdapter {
  constructor(private readonly localStorageService: LocalStorageService) {
    super();
  }

  async upload(file: UploadFileDTO): Promise<UploadFileResult> {
    return this.localStorageService.upload(file);
  }

  async delete(_path: string): Promise<void> {
    throw new NotImplementedException(
      'Delete operation is not implemented for LocalStorageAdapter',
    );
  }
}
