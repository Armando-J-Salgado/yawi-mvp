import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageAdapter } from './storage.adapter';
import { SupabaseStorageService } from '../services/supabase-storage.service';
import { UploadFileDTO } from './interfaces/upload-file.dto';
import { UploadFileResult } from './interfaces/upload-file-result';

@Injectable()
export class SupabaseStorageAdapter extends StorageAdapter {
  constructor(private readonly supabaseStorageService: SupabaseStorageService) {
    super();
  }

  async upload(file: UploadFileDTO): Promise<UploadFileResult> {
    return this.supabaseStorageService.upload(file);
  }

  async delete(_path: string): Promise<void> {
    throw new NotImplementedException(
      'Delete operation is not implemented for SupabaseStorageAdapter',
    );
  }
}
