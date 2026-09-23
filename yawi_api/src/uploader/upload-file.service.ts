import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter } from '../storage/adapters/storage.adapter';
import { LocalStorageAdapter } from '../storage/adapters/local-storage.adapter';
import { SupabaseStorageAdapter } from '../storage/adapters/supabase-storage.adapter';
import { UploadFileDTO } from '../storage/adapters/interfaces/upload-file.dto';
import { UploadFileResult } from '../storage/adapters/interfaces/upload-file-result';

@Injectable()
export class UploadFileService {
  private readonly logger = new Logger(UploadFileService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly localStorageAdapter: LocalStorageAdapter,
    private readonly supabaseStorageAdapter: SupabaseStorageAdapter,
  ) {}

  async execute(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadFileResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File buffer is empty');
    }

    const adapter = this.resolveAdapter();

    const dto: UploadFileDTO = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      folder: folder || 'general',
    };

    return adapter.upload(dto);
  }

  private resolveAdapter(): StorageAdapter {
    const method = this.configService.get<string>('STORAGE_METHOD') || 'local';

    switch (method.toLowerCase()) {
      case 'supabase':
        this.logger.debug('Using SupabaseStorageAdapter');
        return this.supabaseStorageAdapter;
      case 'local':
      default:
        this.logger.debug('Using LocalStorageAdapter');
        return this.localStorageAdapter;
    }
  }
}
